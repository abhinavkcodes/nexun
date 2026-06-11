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
  score: number;       // 0–100
  risk: ATSRisk;
  flags: string[];     // human-readable warnings
}

export interface ContactInfo {
  email: boolean;
  phone: boolean;
  linkedin: boolean;
  github: boolean;
  portfolio: boolean;
  completenessScore: number; // 0–100
}

export interface ReadabilityAnalysis {
  score: number;            // 0–100
  gradeLevel: number;       // Flesch-Kincaid grade
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

  // Top-level derived
  overallScore: number;     // weighted composite 0–100
  parseSuccess: number;     // legacy-compatible parse quality 0–100
  wordCount: number;

  // Qualitative feedback
  experienceStrengths: string[];
  experienceWeaknesses: string[];
  projectStrengths: string[];
  projectWeaknesses: string[];

  // Backward-compat shims (for existing UI)
  readabilityScore: number;
  readingGradeLevel: number;
  pageCount: number;
  resumeLengthStatus: "good" | "warning" | "long"; // legacy mapping
  metricsFound: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Count syllables in a word using a vowel-cluster heuristic. */
function syllablesInWord(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (cleaned.length <= 2) return 1;
  const vowelGroups = cleaned.match(/[aeiouy]+/g);
  let count = vowelGroups?.length ?? 1;
  // Silent trailing 'e'
  if (cleaned.endsWith("e") && cleaned.length > 3) count = Math.max(1, count - 1);
  return Math.max(1, count);
}

/**
 * Flesch-Kincaid Grade Level
 * Industry-standard formula used by Grammarly, Hemingway App, etc.
 * Ideal for resumes: grade 10–14 (professional but not bloated).
 */
function fleschKincaidGrade(text: string): number {
  // Prevent "B.Tech", "M.Sc", "U.S." from being split into false sentence boundaries
  const normalized = text.replace(/\b([A-Z])\.\s*([A-Z])\./g, "$1$2");
  const words = normalized.split(/\s+/).filter(Boolean);
  const sentences = normalized.split(/[.!?]+/).filter((s) => s.trim().length > 4);
  // ... rest unchanged
  if (words.length === 0 || sentences.length === 0) return 12;

  const totalSyllables = words.reduce((n, w) => n + syllablesInWord(w), 0);
  const grade =
    0.39 * (words.length / sentences.length) +
    11.8 * (totalSyllables / words.length) -
    15.59;

  return Math.round(grade * 10) / 10;
}

/**
 * Infer experience level from text heuristics when not supplied explicitly.
 * Checks for years-of-experience mentions and seniority keywords.
 */
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
// Resume Length  (replaces the naive Math.ceil(wordCount / 500))
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Industry word-count benchmarks (sourced from Jobscan, Zety, Resume.io research):
 *   Entry   : 300–600  words  (~1 page)
 *   Mid     : 450–700  words  (~1–1.5 pages)
 *   Senior  : 600–900  words  (~1.5–2 pages)
 *   Executive: 800–1400 words (~2–3 pages)
 *
 * Words-per-page uses 450 (resume-standard dense layout, not 500).
 */


function analyzeResumeLength(
  wordCount: number,
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive' = 'mid',
  characterCount?: number
): ResumeLengthAnalysis {

  // Industry-standard words-per-page (resumes are dense, ~450-550 wpp)
  const WORDS_PER_PAGE = 450;

  // More accurate: use character count if available (avg 5.5 chars/word + spaces)
  const effectiveWordCount = characterCount
    ? Math.round(characterCount / 6.5)
    : wordCount;

  const rawPages = effectiveWordCount / WORDS_PER_PAGE;
  const pageCount = Math.max(1, parseFloat(rawPages.toFixed(1)));

  // Ideal ranges by experience level (industry standard)
  const idealRanges: Record<typeof experienceLevel, { min: number; max: number; words: { min: number; max: number } }> = {
    entry:     { min: 1,   max: 1,   words: { min: 300, max: 600 } },
    mid:       { min: 1,   max: 1.5, words: { min: 400, max: 700 } },
    senior:    { min: 1.5, max: 2,   words: { min: 600, max: 900 } },
    executive: { min: 2,   max: 3,   words: { min: 800, max: 1400 } },
  };

  const range = idealRanges[experienceLevel];
  const wRange = range.words;

  let status: ResumeLengthAnalysis['status'];
  let message: string;
  let score: number;

  if (effectiveWordCount < wRange.min * 0.6) {
    // Severely short
    status = 'too_short';
    message = `Too brief — only ~${pageCount} page. Add more detail about your experience.`;
    score = Math.max(20, Math.round((effectiveWordCount / wRange.min) * 60));

  } else if (effectiveWordCount < wRange.min) {
    // Slightly short but acceptable
    status = 'acceptable';
    message = `Slightly short. Consider expanding your accomplishments.`;
    score = Math.round(60 + ((effectiveWordCount - wRange.min * 0.6) / (wRange.min * 0.4)) * 25);

  } else if (effectiveWordCount <= wRange.max) {
    // Ideal
    status = 'ideal';
    message = `Ideal length for a ${experienceLevel}-level resume.`;
    score = 100;

  } else if (effectiveWordCount <= wRange.max * 1.3) {
    // Slightly over
    status = 'acceptable';
    message = `Slightly long. Try trimming older roles or redundant skills.`;
    score = Math.round(85 - ((effectiveWordCount - wRange.max) / (wRange.max * 0.3)) * 25);

  } else {
    // Too long
    status = 'too_long';
    message = `Too long (~${pageCount} pages). Recruiters spend ~7 seconds — cut it down.`;
    score = Math.max(20, Math.round(60 - ((effectiveWordCount - wRange.max * 1.3) / wRange.max) * 40));
  }

return {
  pageCount,
  wordCount: effectiveWordCount,
  status,
  message,
  score,
};
}
// ─────────────────────────────────────────────────────────────────────────────
// Readability
// ─────────────────────────────────────────────────────────────────────────────

function analyzeReadability(resumeText: string): ReadabilityAnalysis {
  const bullets = resumeText.match(/[-•*▸►✓✔→·]\s*.+/g) ?? [];
  const bulletCount = bullets.length;

  const bulletWords = bullets.map((b) => b.split(/\s+/).length);
  const avgWordsPerBullet =
    bulletCount > 0
      ? Math.round(bulletWords.reduce((a, b) => a + b, 0) / bulletCount)
      : 0;

  const gradeLevel = fleschKincaidGrade(resumeText);

  // Score logic:
  // - Bullet-heavy resumes are easier to parse (ATS + human)
  // - Avg bullet length 8–16 words is ideal (too short = vague, too long = essay)
  // - Grade 10–14 is the professional sweet spot
  let score = 50;

  // Bullet usage
  if (bulletCount >= 15) score += 15;
  else if (bulletCount >= 8) score += 10;
  else if (bulletCount >= 4) score += 5;

  // Bullet length
  if (avgWordsPerBullet >= 8 && avgWordsPerBullet <= 16) score += 20;
  else if (avgWordsPerBullet >= 5 && avgWordsPerBullet <= 20) score += 10;

  // Grade level
  if (gradeLevel >= 10 && gradeLevel <= 14) score += 15;
  else if (gradeLevel >= 8 && gradeLevel <= 16) score += 8;

  score = Math.min(100, score);

// Replace the verdict block at the bottom of analyzeReadability():
const verdict: ReadabilityAnalysis["verdict"] =
  avgWordsPerBullet > 20   ? "verbose"
  : avgWordsPerBullet < 5 && bulletCount > 5 ? "concise"   // genuinely terse
  : score >= 75            ? "concise"
  : score >= 55            ? "acceptable"
  : "verbose";

  return { score, gradeLevel, avgWordsPerBullet, bulletCount, verdict };
}

// ─────────────────────────────────────────────────────────────────────────────
// Metrics Detection
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detects quantified achievements only — filters out noise like phone numbers,
 * years, GPA, and ordinals that naive /\d+/ patterns catch.
 */
function detectMetrics(resumeText: string): string[] {
  const patterns = [
    /\d+(\.\d+)?%/g,                    // 35%, 99.5%
    /\d[\d,]*\+(?!\s*\d)/g,             // 100+, 1,000+ (not phone-like)
    /\$[\d,]+(\.\d+)?[kmb]?/gi,         // $2k, $1,000,000, $5M
    /\d[\d,]*\s*(users|customers|clients|students|records|downloads|requests|projects|transactions|sales|leads|tickets|bugs|issues|lines of code|loc|employees|members|teams?|repos?|endpoints?)\b/gi,
    /\b(increased|decreased|reduced|improved|boosted|cut|grew|saved|generated|accelerated|optimized|scaled)\b.{0,50}?\d[\d,.]+/gi,
    /\b(top|rank(?:ed)?)\s+\d+/gi,      // "top 5", "ranked 1st"
    /\b\d+x\b/gi,                       // "3x faster"
    /\b\d+\s*(ms|seconds?|minutes?|hours?)\b/gi, // performance metrics
  ];

  const matches = new Set<string>();
  for (const pattern of patterns) {
    for (const m of resumeText.matchAll(pattern)) {
      matches.add(m[0].trim().toLowerCase());
    }
  }

  // Strip false positives: phone fragments, years (1900–2099), GPA (x.x/4.0)
  const cleaned = [...matches].filter((m) => {
    if (/^(19|20)\d{2}$/.test(m)) return false;                  // year
    if (/^\d{1,2}[.\s]\d{4,}/.test(m)) return false;             // phone fragment
    if (/^\d\.\d{1,2}\s*\/\s*[45]/.test(m)) return false;        // GPA
    return true;
  });

  return cleaned;
}

// ─────────────────────────────────────────────────────────────────────────────
// ATS Compatibility
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks for patterns that confuse ATS parsers (Taleo, Workday, Greenhouse, etc.)
 * Based on Jobscan and Resume Worded research.
 */
function analyzeATS(
  resumeText: string,
  bulletCount: number,
  wordCount: number,
  resumeLength: ResumeLengthAnalysis
): ATSAnalysis {
  const flags: string[] = [];
  let deductions = 0;

  // ── FORMAT-SIDE CHECKS ────────────────────────────────────────────────────

  if (/\|\s*.+\s*\|/.test(resumeText)) {
    flags.push("Table layout detected");
    deductions += 20;
  }

  if ((resumeText.match(/page\s+\d+\s+of\s+\d+/gi) ?? []).length > 0) {
    flags.push("Page numbers in body text can cause ATS duplication issues.");
    deductions += 10;
  }

  if ((resumeText.match(/[★◆✦◉⬛▪]/g) ?? []).length > 3) {
    flags.push("Non-standard bullet characters may not parse in all ATS systems.");
    deductions += 10;
  }

  const longLines = resumeText.split("\n").filter((l) => l.trim().length > 200);
  if (longLines.length >= 3) {
    flags.push("Very long lines detected — may indicate text-box content ATS cannot read.");
    deductions += 15;
  }

  // ── CONTENT-SIDE CHECKS ───────────────────────────────────────────────────

  // 1. Sparse bullets (dense paragraphs hurt ATS parsing)
  if (bulletCount < 5) {
    flags.push("Low bullet count — ATS systems parse structured bullet points more reliably.");
    deductions += 10;
  }

  // 2. Missing standard section headings
  if (!/\b(experience|employment|work history)\b/i.test(resumeText)) {
    flags.push("No 'Experience' heading found — ATS may miss your work history.");
    deductions += 15;
  }
  if (!/\b(education|degree|university|college)\b/i.test(resumeText)) {
    flags.push("No 'Education' heading found.");
    deductions += 10;
  }

  // 3. No dates — ATS cannot calculate tenure
  if (!/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b/i.test(resumeText)) {
    flags.push("No dates found — ATS cannot calculate tenure or sort experience chronologically.");
    deductions += 15;
  }

  // 4. Keyword stuffing — triggers ATS spam filters
  const wordFreq: Record<string, number> = {};
  for (const w of resumeText.toLowerCase().split(/\W+/)) {
    if (w.length > 4) wordFreq[w] = (wordFreq[w] ?? 0) + 1;
  }
  const stuffed = Object.entries(wordFreq).filter(([, c]) => c > 7);
  if (stuffed.length > 4) {
    flags.push("Repeated keywords detected — may trigger ATS spam filter.");
    deductions += 10;
  }

  // 5. Image-heavy signal (very low word count relative to pages)
  if (wordCount < 150 && resumeLength.pageCount >= 1) {
    flags.push("Very low word count — resume may contain images or graphics that ATS cannot read.");
    deductions += 20;
  }

  // 6. Verb tense consistency — only flag if there is NO current role
  //    (present-tense verbs are correct for an active position)
  const hasPresentRole = /\b(present|current|now)\b/i.test(resumeText);
  const presentTenseCount = (resumeText.match(/\b(build|lead|manage|create|design|develop|maintain|support)\b/gi) ?? []).length;
  if (!hasPresentRole && presentTenseCount > 2) {
    flags.push("Past roles may use present tense — switch to past tense for completed positions.");
    deductions += 8;
  }

  // 7. Location signal — many ATS auto-filter by location
  const hasLocation = /\b([A-Z][a-z]+,?\s*(India|USA|UK|Canada|Remote|[A-Z]{2}))\b/.test(resumeText);
  if (!hasLocation) {
    flags.push("No location detected — some ATS systems filter by geography.");
    deductions += 5;
  }

  const score = Math.max(0, 100 - deductions);
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

  // Weighted: email & phone critical (20 each), linkedin (20), github (20), portfolio (20)
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
  // Each section has a max weight; presence alone earns 40% of that weight,
  // the remaining 60% scales with the section's own quality score (0–100).
  // This prevents a detected-but-empty section from inflating the structure score.
  const weights: Array<{ key: keyof typeof sections; weight: number }> = [
    { key: "experience",          weight: 30 },
    { key: "projects",            weight: 20 },
    { key: "skills",              weight: 18 },
    { key: "education",           weight: 17 },
    { key: "achievements",        weight: 10 },
    { key: "certifications",      weight: 5  },
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
  // Use regex word boundaries — prevents "top" matching "laptop", "rank" matching "ranking tool"
  const tier1 = /\b(icpc|olympiad|championship|gold\s+medal|national\s+winner|international\s+winner|scholarship|valedictorian|summa\s+cum\s+laude)\b/gi;
  const tier2 = /\b(winner|hackathon|ranked\s+\d+|top\s+\d+%?|award|finalist|merit|silver\s+medal|bronze\s+medal|champion|first\s+place|second\s+place)\b/gi;
  const tier3 = /\b(selected|nominated|recognition|honor|dean'?s\s+list|commendation|honorable\s+mention)\b/gi;

  const t1 = (text.match(tier1) ?? []).length;
  const t2 = (text.match(tier2) ?? []).length;
  const t3 = (text.match(tier3) ?? []).length;

  return Math.min(100, t1 * 30 + t2 * 15 + t3 * 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse / ATS Readiness Score  — v2 (5-Pillar Model)
// ─────────────────────────────────────────────────────────────────────────────
//
// Modern ATS Parse Rate Model (2024-2025 best practices)
// Sources: Jobscan, Resume Worded, Lever/Greenhouse parser research.
//
// PILLARS & MAX POINTS:
//  1. Contact Completeness     20 pts  — ATS must find you to contact you
//  2. Section Detectability    25 pts  — standard parseable headings
//  3. Content Quality          20 pts  — bullets, metrics, section scores
//  4. ATS Compatibility        20 pts  — no tables/columns/graphics signals
//  5. Readability & Format     15 pts  — grade level + length + bullet density
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

  // ──────────────────────────────
  // 1. Contact Extraction (20)
  // ──────────────────────────────

  if (contact.email) score += 8;
  if (contact.phone) score += 6;
  if (contact.linkedin) score += 3;
  if (contact.github || contact.portfolio) score += 3;

  // ──────────────────────────────
  // 2. Section Recognition (25)
  // ──────────────────────────────

  if (sections.experience.found) score += 8;
  if (sections.education.found) score += 5;
  if (sections.skills.found) score += 5;
  if (sections.projects.found) score += 4;
  if (sections.certifications.found) score += 3;

  // ──────────────────────────────
  // 3. Date Parsing (15)
  // ──────────────────────────────

  const dateMatches =
    (sections.experience.content.match(
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b/gi
    ) ?? []).length;

  score += Math.min(15, dateMatches * 2);

  // ──────────────────────────────
  // 4. ATS Formatting (20)
  // ──────────────────────────────

  score += Math.round(ats.score * 0.20);

  // ──────────────────────────────
  // 5. Structure (10)
  // ──────────────────────────────

  score += Math.round(
    calcStructureScore(sections) * 0.10
  );

  // ──────────────────────────────
  // 6. Content Density (10)
  // ──────────────────────────────

  let densityScore = 0;

  if (wordCount < 150)
    densityScore = 2;
  else if (wordCount < 300)
    densityScore = 5;
  else if (wordCount < 800)
    densityScore = 10;
  else
    densityScore = 8;

  score += densityScore;

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// Overall Weighted Score
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
  experienceLevel: ExperienceLevel   // ← add this param
): number {
  // Metrics weight scales with seniority — entry resumes aren't punished for few numbers
  const metricsW = experienceLevel === "entry" ? 0.08 : experienceLevel === "mid" ? 0.12 : 0.16;
  const experienceW = 0.22;
  const structureW  = 0.15;
  const atsW        = 0.13;   // raised — ATS gates before humans see the resume
  const projectW    = 0.13;
  const readabilityW = 0.10;
  const achievementW = 0.08;
  const resumeLenW  = 0.05;
  const contactW    = 0.02;
  // Remaining weight fills metrics slot (total always = 1.0)
  const remaining = 1 - (experienceW + structureW + atsW + projectW + readabilityW + achievementW + resumeLenW + contactW);
  const finalMetricsW = Math.min(metricsW, remaining);

  const weighted =
    experience   * experienceW  +
    structure    * structureW   +
    ats          * atsW         +
    metrics      * finalMetricsW +
    project      * projectW     +
    readability  * readabilityW +
    achievement  * achievementW +
    resumeLength * resumeLenW   +
    contact      * contactW;

  return Math.min(100, Math.round(weighted));
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

  // Core derived values
  const wordCount       = resumeText.split(/\s+/).filter(Boolean).length;
  
 const uniqueMetrics   = detectMetrics(resumeText);
const experienceLevel = inferExperienceLevel(resumeText);  // move this up, needed for metricsWeight

// Weight tiers: entry resumes penalized less for low metrics
const metricsScore = Math.min(
  100,
  uniqueMetrics.length * (
    experienceLevel === "entry"
      ? 12
      : experienceLevel === "mid"
      ? 10
      : 8
  )
);
  const resumeLength    = analyzeResumeLength(wordCount, experienceLevel);
  const readability     = analyzeReadability(resumeText);
// Pass wordCount and resumeLength to the new signature
const ats = analyzeATS(resumeText, readability.bulletCount, wordCount, resumeLength);  const contact         = analyzeContact(resumeText);
  const structureScore  = calcStructureScore(sections);
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
  structureScore, experienceScore, projectScore, metricsScore,
  achievementScore, readability.score, resumeLength.score, ats.score,
  contact.completenessScore,
  experienceLevel  // ← pass it
);

  // ── Legacy shims (keep existing UI working without changes) ──────────────
  const legacyStatusMap: Record<ResumeLengthStatus, "good" | "warning" | "long"> = {
    ideal:       "good",
    acceptable:  "warning",
    too_short:   "warning",
    too_long:    "long",
  };
  // Real keyword density: ratio of unique meaningful words vs all meaningful words
  // Ideal: 0.15–0.35 (varied vocabulary, not stuffed or monotonous)
  const allMeaningfulWords = resumeText.toLowerCase().match(/\b[a-z]{5,}\b/g) ?? [];
  const uniqueKeywords = new Set(allMeaningfulWords).size;
  const keywordDensity = allMeaningfulWords.length > 0 ? uniqueKeywords / allMeaningfulWords.length : 0;
  const keywordDensityScore =
    keywordDensity >= 0.15 && keywordDensity <= 0.35
      ? 100
      : keywordDensity < 0.15
      ? Math.round((keywordDensity / 0.15) * 100)
      : Math.round(Math.max(0, 100 - (keywordDensity - 0.35) * 300));

  return {
    structureScore,
    experienceScore,
    projectScore,
    metricsScore,
    achievementScore,

    readability,
    resumeLength,
    ats,
    contact,
  keywordDensityScore,

    overallScore,
    parseSuccess,
    wordCount,

    experienceStrengths:  experienceAnalysis.strengths,
    experienceWeaknesses: experienceAnalysis.weaknesses,
    projectStrengths:     projectAnalysis.strengths,
    projectWeaknesses:    projectAnalysis.weaknesses,

    // Backward-compat shims
    readabilityScore:    readability.score,
    readingGradeLevel:   readability.gradeLevel,
    pageCount:           resumeLength.pageCount,
    resumeLengthStatus:  legacyStatusMap[resumeLength.status],
   metricsFound: uniqueMetrics.length,
  };
}