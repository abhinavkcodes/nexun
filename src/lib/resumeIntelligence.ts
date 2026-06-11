/**
 * resumeIntelligence.ts  (v2 — fixed weights, keyword density, metrics calibration)
 *
 * Key changes from v1:
 *
 *  1. calcOverallScore — weights now sum to exactly 1.0 for BOTH entry and non-entry:
 *       entry:     exp 0.18 + proj 0.18 + struct 0.15 + ats 0.12 + metrics 0.08
 *                  + achieve 0.10 + readability 0.08 + resumeLen 0.05 + contact 0.06 = 1.00 ✓
 *       non-entry: exp 0.22 + proj 0.14 + struct 0.15 + ats 0.12 + metrics 0.12
 *                  + achieve 0.07 + readability 0.08 + resumeLen 0.05 + contact 0.05 = 1.00 ✓
 *     Previously contact was 0.02 but the function passed completenessScore (0–100); raising
 *     it to 0.05/0.06 properly rewards complete contact information.
 *
 *  2. keywordDensityScore — replaced the generic unique-word-ratio formula with a
 *     role-agnostic tech-keyword coverage metric. The old formula gave 100 to virtually
 *     every reasonably-worded resume because English natural-language diversity always
 *     falls in the 0.15–0.35 range. The new formula counts how many of the 40 most
 *     ATS-relevant tech/professional terms the resume contains, normalised to 100.
 *     This is a standalone signal used by resumeIntelligence (separate from the
 *     role-specific keyword density in analyzer.ts).
 *
 *  3. metricsScore — per-metric point values adjusted:
 *       entry: 14 pts/metric (was 12) — fewer metrics expected, should score higher per one
 *       mid:   11 pts/metric (was 10)
 *       senior: 9 pts/metric (was 8)
 *     This means 3 metrics → 42/33/27 for entry/mid/senior, which is more generous
 *     and reflects the reality that even senior engineers often have 5–8 good metrics.
 *
 *  4. analyzeATS (internal) — removed the location-detection deduction. Location is
 *     not consistently present in PDF-extracted text and was causing false penalties.
 *
 *  5. calcStructureScore — updated to include the new professionalSummary and leadership
 *     sections; adjusted weights accordingly so total still normalises to 100.
 */

import { analyzeExperience } from "./experienceAnalyzer";
import { analyzeSections } from "./sectionAnalyzer";
import { analyzeProject } from "./projectAnalyzer";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ExperienceLevel = "entry" | "mid" | "senior" | "executive";
export type ResumeLengthStatus = "ideal" | "acceptable" | "too_short" | "too_long";
export type ATSRisk = "low" | "medium" | "high";

export interface ResumeLengthAnalysis {
  pageCount: number;
  wordCount: number;
  status: ResumeLengthStatus;
  message: string;
  score: number;
}

export interface ATSAnalysis {
  score: number;
  risk: ATSRisk;
  flags: string[];
}

export interface ContactInfo {
  email: boolean;
  phone: boolean;
  linkedin: boolean;
  github: boolean;
  portfolio: boolean;
  completenessScore: number;
}

export interface ReadabilityAnalysis {
  score: number;
  gradeLevel: number;
  avgWordsPerBullet: number;
  bulletCount: number;
  verdict: "concise" | "acceptable" | "verbose";
}

export interface ResumeIntelligenceResult {
  // Section scores
  structureScore: number;
  experienceScore: number;
  projectScore: number;
  metricsScore: number;
  achievementScore: number;
  keywordDensityScore: number;
  // Detailed analyses
  readability: ReadabilityAnalysis;
  resumeLength: ResumeLengthAnalysis;
  ats: ATSAnalysis;
  contact: ContactInfo;

  overallScore: number;
  parseSuccess: number;
  wordCount: number;

  experienceStrengths: string[];
  experienceWeaknesses: string[];
  projectStrengths: string[];
  projectWeaknesses: string[];

  // Backward-compat shims
  readabilityScore: number;
  readingGradeLevel: number;
  pageCount: number;
  resumeLengthStatus: "good" | "warning" | "long";
  metricsFound: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function syllablesInWord(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (cleaned.length <= 2) return 1;
  const vowelGroups = cleaned.match(/[aeiouy]+/g);
  let count = vowelGroups?.length ?? 1;
  if (cleaned.endsWith("e") && cleaned.length > 3) count = Math.max(1, count - 1);
  return Math.max(1, count);
}

function fleschKincaidGrade(text: string): number {
  const normalized = text.replace(/\b([A-Z])\.\s*([A-Z])\./g, "$1$2");
  const words     = normalized.split(/\s+/).filter(Boolean);
  const sentences = normalized.split(/[.!?]+/).filter((s) => s.trim().length > 4);
  if (words.length === 0 || sentences.length === 0) return 12;

  const totalSyllables = words.reduce((n, w) => n + syllablesInWord(w), 0);
  const grade =
    0.39 * (words.length / sentences.length) +
    11.8 * (totalSyllables / words.length) -
    15.59;

  return Math.round(grade * 10) / 10;
}

function inferExperienceLevel(text: string): ExperienceLevel {
  const t = text.toLowerCase();

  const yearMatches = t.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/g) ?? [];
  const maxYears = yearMatches.reduce((max, m) => {
    const n = parseInt(m, 10);
    return isNaN(n) ? max : Math.max(max, n);
  }, 0);

  if (maxYears >= 10 || /\b(vp|director|cto|ceo|chief|head of|principal)\b/.test(t))
    return "executive";
  if (maxYears >= 5 || /\b(senior|sr\.|lead|staff|architect)\b/.test(t))
    return "senior";
  if (maxYears >= 2 || /\b(mid[- ]level|associate|engineer ii|developer ii)\b/.test(t))
    return "mid";
  return "entry";
}

// ─────────────────────────────────────────────────────────────────────────────
// Resume Length
// ─────────────────────────────────────────────────────────────────────────────

function analyzeResumeLength(
  wordCount: number,
  experienceLevel: ExperienceLevel = "mid",
  characterCount?: number
): ResumeLengthAnalysis {
  const WORDS_PER_PAGE = 450;

  const effectiveWordCount = characterCount
    ? Math.round(characterCount / 6.5)
    : wordCount;

  const rawPages  = effectiveWordCount / WORDS_PER_PAGE;
  const pageCount = Math.max(1, parseFloat(rawPages.toFixed(1)));

  const idealRanges: Record<ExperienceLevel, { min: number; max: number; words: { min: number; max: number } }> = {
    entry:     { min: 1,   max: 1,   words: { min: 300,  max: 600  } },
    mid:       { min: 1,   max: 1.5, words: { min: 400,  max: 700  } },
    senior:    { min: 1.5, max: 2,   words: { min: 600,  max: 900  } },
    executive: { min: 2,   max: 3,   words: { min: 800,  max: 1400 } },
  };

  const range  = idealRanges[experienceLevel];
  const wRange = range.words;

  let status: ResumeLengthAnalysis["status"];
  let message: string;
  let score: number;

  if (effectiveWordCount < wRange.min * 0.6) {
    status  = "too_short";
    message = `Too brief — only ~${pageCount} page. Add more detail about your experience.`;
    score   = Math.max(20, Math.round((effectiveWordCount / wRange.min) * 60));
  } else if (effectiveWordCount < wRange.min) {
    status  = "acceptable";
    message = "Slightly short. Consider expanding your accomplishments.";
    score   = Math.round(60 + ((effectiveWordCount - wRange.min * 0.6) / (wRange.min * 0.4)) * 25);
  } else if (effectiveWordCount <= wRange.max) {
    status  = "ideal";
    message = `Ideal length for a ${experienceLevel}-level resume.`;
    score   = 100;
  } else if (effectiveWordCount <= wRange.max * 1.3) {
    status  = "acceptable";
    message = "Slightly long. Try trimming older roles or redundant skills.";
    score   = Math.round(85 - ((effectiveWordCount - wRange.max) / (wRange.max * 0.3)) * 25);
  } else {
    status  = "too_long";
    message = `Too long (~${pageCount} pages). Recruiters spend ~7 seconds — cut it down.`;
    score   = Math.max(20, Math.round(60 - ((effectiveWordCount - wRange.max * 1.3) / wRange.max) * 40));
  }

  return { pageCount, wordCount: effectiveWordCount, status, message, score };
}

// ─────────────────────────────────────────────────────────────────────────────
// Readability
// ─────────────────────────────────────────────────────────────────────────────

function analyzeReadability(resumeText: string): ReadabilityAnalysis {
  const bullets = resumeText.match(/[-•*▸►✓✔→·]\s*.+/g) ?? [];
  const bulletCount = bullets.length;

  const bulletWords    = bullets.map((b) => b.split(/\s+/).length);
  const avgWordsPerBullet =
    bulletCount > 0
      ? Math.round(bulletWords.reduce((a, b) => a + b, 0) / bulletCount)
      : 0;

  const gradeLevel = fleschKincaidGrade(resumeText);

  let score = 50;

  if (bulletCount >= 15)     score += 15;
  else if (bulletCount >= 8) score += 10;
  else if (bulletCount >= 4) score += 5;

  if (avgWordsPerBullet >= 8 && avgWordsPerBullet <= 16)  score += 20;
  else if (avgWordsPerBullet >= 5 && avgWordsPerBullet <= 20) score += 10;

  if (gradeLevel >= 10 && gradeLevel <= 14) score += 15;
  else if (gradeLevel >= 8 && gradeLevel <= 16) score += 8;

  score = Math.min(100, score);

  const verdict: ReadabilityAnalysis["verdict"] =
    avgWordsPerBullet > 20                     ? "verbose"
    : avgWordsPerBullet < 5 && bulletCount > 5 ? "concise"
    : score >= 75                              ? "concise"
    : score >= 55                              ? "acceptable"
    : "verbose";

  return { score, gradeLevel, avgWordsPerBullet, bulletCount, verdict };
}

// ─────────────────────────────────────────────────────────────────────────────
// Metrics Detection
// ─────────────────────────────────────────────────────────────────────────────

function detectMetrics(resumeText: string): string[] {
  const patterns = [
    /\d+(\.\d+)?%/g,
    /\d[\d,]*\+(?!\s*\d)/g,
    /\$[\d,]+(\.\d+)?[kmb]?/gi,
    /\d[\d,]*\s*(users|customers|clients|students|records|downloads|requests|projects|transactions|sales|leads|tickets|bugs|issues|lines of code|loc|employees|members|teams?|repos?|endpoints?)\b/gi,
    /\b(increased|decreased|reduced|improved|boosted|cut|grew|saved|generated|accelerated|optimized|scaled)\b.{0,50}?\d[\d,.]+/gi,
    /\b(top|rank(?:ed)?)\s+\d+/gi,
    /\b\d+x\b/gi,
    /\b\d+\s*(ms|seconds?|minutes?|hours?)\b/gi,
  ];

  const matches = new Set<string>();
  for (const pattern of patterns) {
    for (const m of resumeText.matchAll(pattern)) {
      matches.add(m[0].trim().toLowerCase());
    }
  }

  return [...matches].filter((m) => {
    if (/^(19|20)\d{2}$/.test(m)) return false;
    if (/^\d{1,2}[.\s]\d{4,}/.test(m)) return false;
    if (/^\d\.\d{1,2}\s*\/\s*[45]/.test(m)) return false;
    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ATS Compatibility (internal — separate from atsCompliance.ts)
// ─────────────────────────────────────────────────────────────────────────────

function analyzeATSInternal(
  resumeText: string,
  bulletCount: number,
  wordCount: number,
  resumeLength: ResumeLengthAnalysis
): ATSAnalysis {
  const flags: string[] = [];
  let deductions = 0;

  // Format checks
  if (/\|\s*.+\s*\|/.test(resumeText)) {
    flags.push("Table layout detected — may cause ATS parsing errors");
    deductions += 20;
  }

  if ((resumeText.match(/page\s+\d+\s+of\s+\d+/gi) ?? []).length > 0) {
    flags.push("Page numbers in body text can cause ATS duplication issues");
    deductions += 10;
  }

  if ((resumeText.match(/[★◆✦◉⬛▪]/g) ?? []).length > 3) {
    flags.push("Non-standard bullet characters may not parse in all ATS systems");
    deductions += 10;
  }

  const longLines = resumeText.split("\n").filter((l) => l.trim().length > 200);
  if (longLines.length >= 3) {
    flags.push("Very long lines detected — may indicate text-box content ATS cannot read");
    deductions += 15;
  }

  // Content checks
  if (bulletCount < 5) {
    flags.push("Low bullet count — ATS systems parse structured bullet points more reliably");
    deductions += 10;
  }

  if (!/\b(experience|employment|work history)\b/i.test(resumeText)) {
    flags.push("No 'Experience' heading found — ATS may miss your work history");
    deductions += 15;
  }

  if (!/\b(education|degree|university|college)\b/i.test(resumeText)) {
    flags.push("No 'Education' heading found");
    deductions += 10;
  }

  if (!/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b/i.test(resumeText)) {
    flags.push("No dates found — ATS cannot calculate tenure or sort experience chronologically");
    deductions += 15;
  }

  // Keyword stuffing check
  const wordFreq: Record<string, number> = {};
  for (const w of resumeText.toLowerCase().split(/\W+/)) {
    if (w.length > 4) wordFreq[w] = (wordFreq[w] ?? 0) + 1;
  }
  const stuffed = Object.entries(wordFreq).filter(([, c]) => c > 7);
  if (stuffed.length > 4) {
    flags.push("Repeated keywords detected — may trigger ATS spam filter");
    deductions += 10;
  }

  // Image-heavy signal
  if (wordCount < 150 && resumeLength.pageCount >= 1) {
    flags.push("Very low word count — resume may contain images or graphics ATS cannot read");
    deductions += 20;
  }

  // Verb tense consistency (only flag when no present role)
  const hasPresentRole      = /\b(present|current|now)\b/i.test(resumeText);
  const presentTenseCount   = (resumeText.match(/\b(build|lead|manage|create|design|develop|maintain|support)\b/gi) ?? []).length;
  if (!hasPresentRole && presentTenseCount > 2) {
    flags.push("Past roles may use present tense — switch to past tense for completed positions");
    deductions += 8;
  }

  // REMOVED: location deduction — unreliable in PDF-extracted text

  const score: number = Math.max(0, 100 - deductions);
  const risk: ATSRisk = score >= 75 ? "low" : score >= 50 ? "medium" : "high";

  return { score, risk, flags };
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact Info
// ─────────────────────────────────────────────────────────────────────────────

function analyzeContact(resumeText: string): ContactInfo {
  const t = resumeText.toLowerCase();

  const email     = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const phone     = /(\+?\d[\d\s\-().]{7,}\d)/.test(resumeText);
  const linkedin  = t.includes("linkedin");
  const github    = t.includes("github");
  const portfolio = /\b(portfolio|website|myblog|behance|dribbble|leetcode|codeforces)\b/.test(t)
                    || /https?:\/\/(?!linkedin|github)/.test(resumeText);

  let completenessScore = 0;
  if (email)     completenessScore += 25;
  if (phone)     completenessScore += 20;
  if (linkedin)  completenessScore += 20;
  if (github)    completenessScore += 20;
  if (portfolio) completenessScore += 15;

  return { email, phone, linkedin, github, portfolio, completenessScore };
}

// ─────────────────────────────────────────────────────────────────────────────
// Structure Score
// ─────────────────────────────────────────────────────────────────────────────

function calcStructureScore(
  sections: ReturnType<typeof analyzeSections>
): number {
  // Updated to include professionalSummary (+5) and leadership (+3)
  // Weights adjusted so total still scales to 100
  const weights: Array<{ key: keyof typeof sections; weight: number }> = [
    { key: "experience",          weight: 27 },
    { key: "projects",            weight: 18 },
    { key: "skills",              weight: 16 },
    { key: "education",           weight: 15 },
    { key: "achievements",        weight: 9  },
    { key: "certifications",      weight: 5  },
    { key: "professionalSummary", weight: 7  },
    { key: "leadership",          weight: 3  },
  ];

  let score = 0;
  for (const { key, weight } of weights) {
    const section = sections[key];
    if (section.found) {
      // 40% for presence, 60% proportional to section quality
      score += weight * (0.4 + 0.6 * (section.score / 100));
    }
  }

  return Math.min(100, Math.round(score));
}

// ─────────────────────────────────────────────────────────────────────────────
// Achievement Score
// ─────────────────────────────────────────────────────────────────────────────

function calcAchievementScore(text: string): number {
  const tier1 = /\b(icpc|olympiad|championship|gold\s+medal|national\s+winner|international\s+winner|scholarship|valedictorian|summa\s+cum\s+laude)\b/gi;
  const tier2 = /\b(winner|hackathon|ranked\s+\d+|top\s+\d+%?|award|finalist|merit|silver\s+medal|bronze\s+medal|champion|first\s+place|second\s+place)\b/gi;
  const tier3 = /\b(selected|nominated|recognition|honor|dean'?s\s+list|commendation|honorable\s+mention)\b/gi;

  const t1 = (text.match(tier1) ?? []).length;
  const t2 = (text.match(tier2) ?? []).length;
  const t3 = (text.match(tier3) ?? []).length;

  return Math.min(100, t1 * 30 + t2 * 15 + t3 * 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse / ATS Readiness Score
// ─────────────────────────────────────────────────────────────────────────────

function calcParseScore(
  contact: ContactInfo,
  sections: ReturnType<typeof analyzeSections>,
  resumeLength: ResumeLengthAnalysis,
  readability: ReadabilityAnalysis,
  ats: ATSAnalysis,
  wordCount: number
): number {
  let score = 0;

  // 1. Contact Extraction (20)
  if (contact.email)                         score += 8;
  if (contact.phone)                         score += 6;
  if (contact.linkedin)                      score += 3;
  if (contact.github || contact.portfolio)   score += 3;

  // 2. Section Recognition (25)
  if (sections.experience.found)      score += 8;
  if (sections.education.found)       score += 5;
  if (sections.skills.found)          score += 5;
  if (sections.projects.found)        score += 4;
  if (sections.certifications.found)  score += 3;

  // 3. Date Parsing (15)
  const dateMatches =
    (sections.experience.content.match(
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b/gi
    ) ?? []).length;
  score += Math.min(15, dateMatches * 2);

  // 4. ATS Formatting (20)
  score += Math.round(ats.score * 0.20);

  // 5. Structure (10)
  score += Math.round(calcStructureScore(sections) * 0.10);

  // 6. Content Density (10)
  let densityScore = 0;
  if (wordCount < 150)       densityScore = 2;
  else if (wordCount < 300)  densityScore = 5;
  else if (wordCount < 800)  densityScore = 10;
  else                       densityScore = 8;
  score += densityScore;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyword Density Score — role-agnostic tech coverage
//
// The old formula (unique meaningful words / all meaningful words) was measuring
// English vocabulary diversity, not ATS keyword relevance. Almost every resume
// scored 100 because natural English writing always falls in the 0.15–0.35 range.
//
// New approach: count how many of the 40 most ATS-relevant professional/tech terms
// the resume contains. This is a standalone complement to the role-specific score
// in analyzer.ts (which uses the role profile). This one catches resumes that are
// missing generic professional vocabulary entirely.
// ─────────────────────────────────────────────────────────────────────────────

const ATS_TECH_KEYWORDS = [
  // Programming & web
  "python", "javascript", "typescript", "java", "react", "node", "sql",
  "html", "css", "api", "rest", "graphql", "git", "docker", "aws",
  // Data / ML
  "machine learning", "data", "analytics", "tensorflow", "pytorch", "pandas",
  // DevOps / cloud
  "kubernetes", "ci/cd", "linux", "azure", "gcp", "cloud",
  // Process / methodology
  "agile", "scrum", "sprint", "deployment", "testing", "pipeline",
  // Generic professional
  "database", "backend", "frontend", "microservice", "performance",
  "scalable", "production", "automation", "integration", "architecture",
];

function computeKeywordCoverageScore(resumeLower: string): number {
  const found = ATS_TECH_KEYWORDS.filter((kw) => resumeLower.includes(kw)).length;
  // 15+ = 100, scaled down proportionally below that
  return Math.min(100, Math.round((found / 15) * 100));
}

// ─────────────────────────────────────────────────────────────────────────────
// Overall Weighted Score  — weights sum to exactly 1.0 for both entry and non-entry
// ─────────────────────────────────────────────────────────────────────────────

function calcOverallScore(
  structure: number,
  experience: number,
  project: number,
  metrics: number,
  achievement: number,
  readability: number,
  resumeLength: number,
  ats: number,
  contact: number,
  experienceLevel: ExperienceLevel
): number {
  const isEntry = experienceLevel === "entry";

  // Entry:     0.18+0.18+0.15+0.12+0.08+0.10+0.08+0.05+0.06 = 1.00 ✓
  // Non-entry: 0.22+0.14+0.15+0.12+0.12+0.07+0.08+0.05+0.05 = 1.00 ✓
  const experienceW  = isEntry ? 0.18 : 0.22;
  const projectW     = isEntry ? 0.18 : 0.14;
  const structureW   = 0.15;
  const atsW         = 0.12;
  const metricsW     = isEntry ? 0.08 : 0.12;
  const achievementW = isEntry ? 0.10 : 0.07;
  const readabilityW = 0.08;
  const resumeLenW   = 0.05;
  const contactW     = isEntry ? 0.06 : 0.05;

  const weighted =
    experience   * experienceW  +
    project      * projectW     +
    structure    * structureW   +
    ats          * atsW         +
    metrics      * metricsW     +
    achievement  * achievementW +
    readability  * readabilityW +
    resumeLength * resumeLenW   +
    contact      * contactW;

  return Math.min(100, Math.max(10, Math.round(weighted)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeResumeIntelligence(resumeText: string): ResumeIntelligenceResult {
  const sections           = analyzeSections(resumeText);
  const experienceAnalysis = analyzeExperience(sections.experience.content);
  const projectAnalysis    = analyzeProject(sections.projects.content);

  const experienceScore = experienceAnalysis.score;
  const projectScore    = projectAnalysis.score;

  const wordCount       = resumeText.split(/\s+/).filter(Boolean).length;
  const uniqueMetrics   = detectMetrics(resumeText);
  const experienceLevel = inferExperienceLevel(resumeText);

  // Calibrated per-metric points by level
  const metricsScore = Math.min(
    100,
    uniqueMetrics.length * (
      experienceLevel === "entry"     ? 14 :
      experienceLevel === "mid"       ? 11 :
      /* senior/executive */            9
    )
  );

  const resumeLength     = analyzeResumeLength(wordCount, experienceLevel);
  const readability      = analyzeReadability(resumeText);
  const ats              = analyzeATSInternal(resumeText, readability.bulletCount, wordCount, resumeLength);
  const contact          = analyzeContact(resumeText);
  const structureScore   = calcStructureScore(sections);
  const achievementScore = calcAchievementScore(resumeText);

  const parseSuccess = calcParseScore(
    contact,
    sections,
    resumeLength,
    readability,
    ats,
    wordCount
  );

  const overallScore = calcOverallScore(
    structureScore,
    experienceScore,
    projectScore,
    metricsScore,
    achievementScore,
    readability.score,
    resumeLength.score,
    ats.score,
    contact.completenessScore,
    experienceLevel
  );

  // Role-agnostic keyword coverage (used by atsEngine as intelligence.keywordDensityScore)
  const keywordDensityScore = computeKeywordCoverageScore(resumeText.toLowerCase());

  const legacyStatusMap: Record<ResumeLengthStatus, "good" | "warning" | "long"> = {
    ideal:      "good",
    acceptable: "warning",
    too_short:  "warning",
    too_long:   "long",
  };

  return {
    structureScore,
    experienceScore,
    projectScore,
    metricsScore,
    achievementScore,
    keywordDensityScore,

    readability,
    resumeLength,
    ats,
    contact,

    overallScore,
    parseSuccess,
    wordCount,

    experienceStrengths:  experienceAnalysis.strengths,
    experienceWeaknesses: experienceAnalysis.weaknesses,
    projectStrengths:     projectAnalysis.strengths,
    projectWeaknesses:    projectAnalysis.weaknesses,

    readabilityScore:    readability.score,
    readingGradeLevel:   readability.gradeLevel,
    pageCount:           resumeLength.pageCount,
    resumeLengthStatus:  legacyStatusMap[resumeLength.status],
    metricsFound:        uniqueMetrics.length,
  };
}