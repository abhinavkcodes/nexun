import { analyzeSections } from "./sectionAnalyzer";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ATSComplianceChecks {
  // Contact
  email: boolean;
  phone: boolean;
  linkedin: boolean;
  github: boolean;
  portfolio: boolean;
  // Structure
  skillsSection: boolean;
  experienceSection: boolean;
  educationSection: boolean;
  projectsSection: boolean;
  certificationsSection: boolean;
  // Formatting safety
  noTables: boolean;
  noFancyBullets: boolean;
  noTextBoxSignals: boolean;
  standardSectionHeadings: boolean;
  // Content quality
  hasSufficientLength: boolean;
  hasQuantifiedAchievements: boolean;
  hasActionVerbs: boolean;
  hasDateFormats: boolean;
  noSpellIssues: boolean;
  noFirstPerson: boolean;
}

export interface ATSComplianceResult {
  score: number;               // 0–100
  checks: ATSComplianceChecks;
  warnings: string[];
  strengths: string[];
  // Breakdown scores (each normalised 0–100 for UI display)
  contactScore: number;
  structureScore: number;
  formattingScore: number;
  contentScore: number;
}

// ── Weights (raw points, total = 100) ─────────────────────────────────────────
// Sourced from Jobscan, Resume Worded, and Greenhouse/Taleo parsing research:
//  - Contact (20): missing email = instant discard
//  - Structure (30): section headings are the primary ATS parsing signal
//  - Formatting (20): tables / text-boxes cause catastrophic mis-parses
//  - Content (30): keyword & quality signals that determine ranking rank

const CONTACT_MAX    = 20;
const STRUCTURE_MAX  = 30;
const FORMATTING_MAX = 20;
const CONTENT_MAX    = 30;

// ── Action verbs ──────────────────────────────────────────────────────────────
// Tier 1: high-signal verbs (engineering / product / leadership heavy)
const ACTION_VERBS_T1 = [
  "architected", "engineered", "designed", "built", "developed", "implemented",
  "deployed", "automated", "optimized", "scaled", "migrated", "refactored",
  "led", "launched", "delivered", "reduced", "increased", "generated",
];

// Tier 2: acceptable but weaker
const ACTION_VERBS_T2 = [
  "created", "managed", "owned", "improved", "streamlined", "integrated",
  "maintained", "resolved", "collaborated", "contributed", "assisted",
  "supported", "worked", "helped", "participated",
];

// ── Spelling mistakes ─────────────────────────────────────────────────────────
const TYPO_PATTERNS: [RegExp, string][] = [
  [/\bexperiance\b/i,        "experiEnce"],
  [/\bresponsibilties\b/i,   "responsibiliTies"],
  [/\bmanagment\b/i,         "managEment"],
  [/\bdevelopement\b/i,      "develoPment"],
  [/\bimplmentation\b/i,     "implEmentation"],
  [/\baccomplishements\b/i,  "accomplishMents"],
  [/\brecieve\b/i,           "recEive"],
  [/\bacheive\b/i,           "achIeve"],
  [/\boccured\b/i,           "occuRred"],
  [/\bseperate\b/i,          "sepArate"],
];

// ── Standard section heading aliases (what real ATS parsers recognise) ────────
// Based on Greenhouse, Taleo, Workday, iCIMS parsing documentation.
const SECTION_HEADING_ALIASES: Record<string, RegExp> = {
  experience: /\b(experience|work history|employment|professional background|career history)\b/i,
  education:  /\b(education|academic background|qualifications|degrees?)\b/i,
  skills:     /\b(skills|technical skills|core competencies|technologies|tech stack)\b/i,
  projects:   /\b(projects?|portfolio|personal projects?|side projects?|open[- ]?source)\b/i,
  summary:    /\b(summary|objective|profile|about me|professional summary|career objective)\b/i,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Detects phone numbers in multiple international formats:
 *   +1 (555) 123-4567   North American
 *   +91 98765 43210     Indian mobile
 *   +44 7911 123456     UK / general E.164
 */
function detectPhone(text: string): boolean {
  const stripped = text.replace(/[\s\-().]/g, "");
  return (
    /(\+?1)?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/.test(text) ||  // North American
    /(\+91)?[6-9]\d{9}/.test(stripped) ||                            // Indian
    /\+[1-9]\d{6,14}/.test(stripped)                                 // General E.164
  );
}

/**
 * Counts unique quantified achievements — filters out phone digits, years, GPA.
 * Valid:   35%, 10,000 users, 50+ downloads, $2k revenue, "reduced by 40ms"
 * Invalid: 2024, +91 9876543210, 8.5 CGPA
 */
function countQuantifiedAchievements(text: string): number {
  const patterns = [
    /\d+(\.\d+)?%/g,
    /\d[\d,]*\+(?!\s*\d)/g,
    /\$[\d,]+(\.\d+)?[kmb]?/gi,
    /\b\d+x\b/gi,
    /\d[\d,]*\s*ms\b/gi,
    /\d[\d,]*\s*(users|customers|clients|students|records|downloads|requests|transactions|sales|leads|bugs|tickets|employees|members|repos?)\b/gi,
    /\b(increased|reduced|improved|boosted|cut|grew|saved|generated|decreased|optimized)\b.{0,60}\d+/gi,
  ];

  const all = new Set<string>();
  for (const p of patterns) {
    for (const m of text.matchAll(p)) {
      const clean = m[0].trim().toLowerCase();
      // Filter false positives
      if (/^(19|20)\d{2}$/.test(clean)) continue;           // year
      if (/^\d\.\d{1,2}\s*\/\s*[45]/.test(clean)) continue; // GPA
      all.add(clean);
    }
  }
  return all.size;
}

/**
 * Checks whether dates follow ATS-safe formats.
 * ATS parsers reliably parse:  "Jan 2023", "January 2023", "2021 – 2023", "Present"
 * They struggle with:          "Q1 2023", "Spring 2022", "2023/01"
 */
function detectDateFormats(text: string): boolean {
  const safeDate = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b|\b\d{4}\s*[–\-—]\s*(\d{4}|Present|present|Current|current)\b/i;
  return safeDate.test(text);
}

// ── Main export ───────────────────────────────────────────────────────────────

export function analyzeATSCompliance(resumeText: string): ATSComplianceResult {
  const sections = analyzeSections(resumeText);
  const lower    = resumeText.toLowerCase();
  const warnings: string[] = [];
  const strengths: string[] = [];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. CONTACT  (max 20 pts)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const email     = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i.test(resumeText);
  const phone     = detectPhone(resumeText);
  const linkedin  = /(linkedin\.com\/in\/[\w\-]+|linkedin\.com)/i.test(resumeText);
  const github    = /(github\.com\/[\w\-]+|github\.com)/i.test(resumeText);
  const portfolio = /\b(portfolio|personal site|website)\b/i.test(lower)
                    || /https?:\/\/(?!linkedin|github)[\w\-]+\.\w+/.test(resumeText);

  let contactRaw = 0;
  if (email) {
    contactRaw += 7;
    strengths.push("Professional email address detected");
  } else {
    warnings.push("No email address found — ATS cannot route your application");
  }
  if (phone) {
    contactRaw += 5;
    strengths.push("Phone number detected");
  } else {
    warnings.push("No phone number found — add a standard format (e.g. +1 555 123 4567)");
  }
  if (linkedin) {
    contactRaw += 4;
    strengths.push("LinkedIn URL present");
  } else {
    warnings.push("Add your LinkedIn URL (linkedin.com/in/yourname) — most ATS systems index it");
  }
  if (github) {
    contactRaw += 3;
    strengths.push("GitHub URL present");
  } else {
    warnings.push("Add your GitHub URL to surface public work");
  }
  if (portfolio) {
    contactRaw += 1;
    strengths.push("Portfolio / personal website detected");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. STRUCTURE  (max 30 pts)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const skillsSection         = sections.skills.found;
  const experienceSection     = sections.experience.found;
  const educationSection      = sections.education.found;
  const projectsSection       = sections.projects.found;
  const certificationsSection = sections.certifications.found;

  // Verify headings use standard ATS-recognisable aliases
  const standardSectionHeadings =
    Object.values(SECTION_HEADING_ALIASES).filter((re) => re.test(resumeText)).length >= 3;

  let structureRaw = 0;
  if (experienceSection) {
    structureRaw += 10;
    strengths.push("Experience section detected");
  } else {
    warnings.push("No Experience section — this is the most critical ATS parsing target");
  }
  if (skillsSection) {
    structureRaw += 8;
    strengths.push("Skills section present — ATS can extract your tech stack");
  } else {
    warnings.push("No Skills section — ATS keyword matching will fail without it");
  }
  if (educationSection) {
    structureRaw += 6;
    strengths.push("Education section present");
  } else {
    warnings.push("No Education section found");
  }
  if (projectsSection) {
    structureRaw += 4;
    strengths.push("Projects section present");
  } else {
    warnings.push("No Projects section — adds signal for technical and early-career roles");
  }
  if (certificationsSection) {
    structureRaw += 2;
    strengths.push("Certifications section present");
  }
  if (standardSectionHeadings) {
    strengths.push("Section headings use ATS-standard terminology");
  } else {
    warnings.push("Use standard section labels: 'Experience', 'Skills', 'Education', 'Projects' — avoid creative labels like 'My Journey'");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. FORMATTING SAFETY  (max 20 pts)
  //    Based on known Taleo, Workday, Greenhouse parsing failure modes.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Tables: pipe-delimited text or markdown table patterns
  const noTables = !/(\|\s*.{3,}\s*\|)/.test(resumeText);

  // Non-standard / decorative bullet characters that trip up parsers
  const fancyBulletCount = (resumeText.match(/[★◆✦◉⬛▪❖➢➤]/g) ?? []).length;
  const noFancyBullets   = fancyBulletCount < 3;

  // Text-box signal: very long unbroken lines (>180 chars) in quantity
  const longLines        = resumeText.split("\n").filter((l) => l.trim().length > 180);
  const noTextBoxSignals = longLines.length < 3;

  let formattingRaw = 0;
  if (noTables) {
    formattingRaw += 8;
    strengths.push("No table structures detected — ATS-safe layout");
  } else {
    warnings.push("Table layout detected — most ATS parsers linearise tables and scramble column order; use plain text sections instead");
  }
  if (noFancyBullets) {
    formattingRaw += 6;
  } else {
    warnings.push(`${fancyBulletCount} decorative bullet characters detected — replace with standard hyphens or dots for reliable ATS parsing`);
  }
  if (noTextBoxSignals) {
    formattingRaw += 6;
  } else {
    warnings.push("Very long unbroken lines detected — may indicate text-box content that ATS cannot extract; move to body text");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. CONTENT QUALITY  (max 30 pts)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const wordCount           = resumeText.split(/\s+/).filter(Boolean).length;
  const hasSufficientLength = wordCount >= 300;

  const achievementCount          = countQuantifiedAchievements(resumeText);
  const hasQuantifiedAchievements = achievementCount >= 2;

  // Tier 1 verbs score higher than Tier 2
  const t1Matches = ACTION_VERBS_T1.filter((v) => lower.includes(v));
  const t2Matches = ACTION_VERBS_T2.filter((v) => lower.includes(v));
  const hasActionVerbs = t1Matches.length >= 3 || (t1Matches.length + t2Matches.length) >= 5;

  const hasDateFormats = detectDateFormats(resumeText);

  // First-person pronouns are a known ATS/recruiter flag
  const firstPersonCount = (resumeText.match(/\b(I|me|my|myself|we|our)\b/g) ?? []).length;
  const noFirstPerson    = firstPersonCount < 3;

  const typoFound    = TYPO_PATTERNS.filter(([re]) => re.test(resumeText));
  const noSpellIssues = typoFound.length === 0;

  let contentRaw = 0;
  if (hasSufficientLength) {
    contentRaw += 5;
    strengths.push(`Resume has sufficient content (${wordCount} words)`);
  } else {
    warnings.push(`Resume is too brief (${wordCount} words) — aim for at least 300 words; entry-level: 300–500, experienced: 500–800`);
  }
  if (hasQuantifiedAchievements) {
    contentRaw += 10;
    strengths.push(`${achievementCount} quantified achievement${achievementCount > 1 ? "s" : ""} detected — strong ATS ranking signal`);
  } else {
    warnings.push("No quantified achievements found — add numbers: 'reduced load time by 35%', 'served 5,000+ users', 'saved $2k/month'");
  }
  if (hasActionVerbs) {
    contentRaw += 8;
    const topVerbs = [...t1Matches, ...t2Matches].slice(0, 3);
    strengths.push(`Strong action verbs detected: ${topVerbs.join(", ")}`);
  } else {
    const verbSuggestions = ACTION_VERBS_T1.slice(0, 5).join(", ");
    warnings.push(`Too few action verbs — start every bullet with verbs like: ${verbSuggestions}`);
  }
  if (hasDateFormats) {
    contentRaw += 4;
    strengths.push("Date formats are ATS-readable (e.g. Jan 2023, 2021–2023)");
  } else {
    warnings.push("Use ATS-standard date formats: 'Jan 2023', 'September 2021 – Present' — avoid 'Q1 2023' or 'Spring 2022'");
  }
  if (noFirstPerson) {
    contentRaw += 2;
  } else {
    warnings.push(`Avoid first-person pronouns (I, me, my) — use action verb sentences: 'Built X' not 'I built X'`);
  }
  if (noSpellIssues) {
    contentRaw += 1;
  } else {
    const typoList = typoFound.map(([, fix]) => fix).join(", ");
    warnings.push(`Possible spelling issue${typoFound.length > 1 ? "s" : ""} detected — check: ${typoList}`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. COMPOSITE SCORE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const score = Math.min(
    100,
    Math.round(contactRaw + structureRaw + formattingRaw + contentRaw)
  );

  return {
    score,
    checks: {
      email, phone, linkedin, github, portfolio,
      skillsSection, experienceSection, educationSection,
      projectsSection, certificationsSection,
      noTables, noFancyBullets, noTextBoxSignals, standardSectionHeadings,
      hasSufficientLength, hasQuantifiedAchievements, hasActionVerbs,
      hasDateFormats, noSpellIssues, noFirstPerson,
    },
    warnings,
    strengths,
    // Each sub-score normalised to 0–100 for UI display
    contactScore:    Math.round((contactRaw    / CONTACT_MAX)    * 100),
    structureScore:  Math.round((structureRaw  / STRUCTURE_MAX)  * 100),
    formattingScore: Math.round((formattingRaw / FORMATTING_MAX) * 100),
    contentScore:    Math.round((contentRaw    / CONTENT_MAX)    * 100),
  };
}