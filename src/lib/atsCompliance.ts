/**
 * atsCompliance.ts  (v2 — calibrated thresholds)
 *
 * Key changes from v1:
 *  - hasActionVerbs: threshold lowered to t1 >= 2 || combined >= 4 (was t1 >= 3 || combined >= 5).
 *    A student with one internship legitimately has fewer bullets and therefore fewer verb
 *    matches. This was the single biggest reason entry-level resumes scored unfairly low.
 *  - countQuantifiedAchievements: hasQuantifiedAchievements now requires only 1 (was 2).
 *    The content score awards 10 pts for this; one good metric is a clear positive signal.
 *  - hasSufficientLength: threshold kept at 300 words but warning text improved.
 *  - structureRaw: added `professionalSummary` check (+2 pts) since route.ts now surfaces it.
 *  - contactRaw: portfolio points bumped from 1 → 2 (a portfolio URL is increasingly expected
 *    for tech roles, and 1 pt was barely worth the ATS overhead of checking).
 *  - Formatting: `flags` field exposed for the atsChecklist in route.ts.
 */

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
  flags: string[];             // human-readable ATS risk flags (used by route.ts atsChecklist)
  // Breakdown scores (each normalised 0–100 for UI display)
  contactScore: number;
  structureScore: number;
  formattingScore: number;
  contentScore: number;
}

// ── Weights (raw points, total = 100) ─────────────────────────────────────────
// Contact (20), Structure (30), Formatting (20), Content (30)
const CONTACT_MAX    = 20;
const STRUCTURE_MAX  = 32;   // +2 for summary check; normalised back to 100 for display
const FORMATTING_MAX = 20;
const CONTENT_MAX    = 30;

// ── Action verbs ──────────────────────────────────────────────────────────────
const ACTION_VERBS_T1 = [
  "architected", "engineered", "designed", "built", "developed", "implemented",
  "deployed", "automated", "optimized", "scaled", "migrated", "refactored",
  "led", "launched", "delivered", "reduced", "increased", "generated",
];

const ACTION_VERBS_T2 = [
  "created", "managed", "owned", "improved", "streamlined", "integrated",
  "maintained", "resolved", "collaborated", "contributed", "assisted",
  "supported", "worked", "helped", "participated", "analyzed",
];

// ── Spelling mistakes ─────────────────────────────────────────────────────────
const TYPO_PATTERNS: [RegExp, string][] = [
  [/\bexperiance\b/i,        "experience"],
  [/\bresponsibilties\b/i,   "responsibilities"],
  [/\bmanagment\b/i,         "management"],
  [/\bdevelopement\b/i,      "development"],
  [/\bimplmentation\b/i,     "implementation"],
  [/\baccomplishements\b/i,  "accomplishments"],
  [/\brecieve\b/i,           "receive"],
  [/\bacheive\b/i,           "achieve"],
  [/\boccured\b/i,           "occurred"],
  [/\bseperate\b/i,          "separate"],
];

// ── Standard section heading aliases ─────────────────────────────────────────
const SECTION_HEADING_ALIASES: Record<string, RegExp> = {
  experience: /\b(experience|work history|employment|professional background|career history)\b/i,
  education:  /\b(education|academic background|qualifications|degrees?)\b/i,
  skills:     /\b(skills|technical skills|core competencies|technologies|tech stack)\b/i,
  projects:   /\b(projects?|portfolio|personal projects?|side projects?|open[- ]?source)\b/i,
  summary:    /\b(summary|objective|profile|about me|professional summary|career objective)\b/i,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectPhone(text: string): boolean {
  const stripped = text.replace(/[\s\-().]/g, "");
  return (
    /(\+?1)?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/.test(text) ||
    /(\+91)?[6-9]\d{9}/.test(stripped) ||
    /\+[1-9]\d{6,14}/.test(stripped)
  );
}

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
      if (/^(19|20)\d{2}$/.test(clean)) continue;
      if (/^\d\.\d{1,2}\s*\/\s*[45]/.test(clean)) continue;
      all.add(clean);
    }
  }
  return all.size;
}

function detectDateFormats(text: string): boolean {
  const safeDate =
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b|\b\d{4}\s*[–\-—]\s*(\d{4}|Present|present|Current|current)\b/i;
  return safeDate.test(text);
}

// ── Main export ───────────────────────────────────────────────────────────────

export function analyzeATSCompliance(resumeText: string): ATSComplianceResult {
  const sections = analyzeSections(resumeText);
  const lower    = resumeText.toLowerCase();
  const warnings: string[] = [];
  const strengths: string[] = [];
  const flags: string[] = [];   // ATS risk flags surfaced in route.ts checklist

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
    flags.push("Missing email address");
  }
  if (phone) {
    contactRaw += 5;
    strengths.push("Phone number detected");
  } else {
    warnings.push("No phone number found — add a standard format (e.g. +1 555 123 4567)");
    flags.push("Missing phone number");
  }
  if (linkedin) {
    contactRaw += 4;
    strengths.push("LinkedIn URL present");
  } else {
    warnings.push("Add your LinkedIn URL (linkedin.com/in/yourname) — most ATS systems index it");
    flags.push("Missing LinkedIn URL");
  }
  if (github) {
    contactRaw += 2;
    strengths.push("GitHub URL present");
  } else {
    warnings.push("Add your GitHub URL to surface public work");
  }
  if (portfolio) {
    contactRaw += 2;   // bumped from 1 → 2
    strengths.push("Portfolio / personal website detected");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. STRUCTURE  (max 32 raw pts, displayed as /100)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const skillsSection         = sections.skills.found;
  const experienceSection     = sections.experience.found;
  const educationSection      = sections.education.found;
  const projectsSection       = sections.projects.found;
  const certificationsSection = sections.certifications.found;

  const standardSectionHeadings =
    Object.values(SECTION_HEADING_ALIASES).filter((re) => re.test(resumeText)).length >= 3;

  let structureRaw = 0;
  if (experienceSection) {
    structureRaw += 10;
    strengths.push("Experience section detected");
  } else {
    warnings.push("No Experience section — this is the most critical ATS parsing target");
    flags.push("Experience section missing");
  }
  if (skillsSection) {
    structureRaw += 8;
    strengths.push("Skills section present — ATS can extract your tech stack");
  } else {
    warnings.push("No Skills section — ATS keyword matching will fail without it");
    flags.push("Skills section missing");
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
  if (sections.professionalSummary.found) {
    structureRaw += 2; // bonus: summary improves ATS profile
    strengths.push("Professional summary section present");
  }
  if (certificationsSection) {
    structureRaw += 2;
    strengths.push("Certifications section present");
  }
  if (standardSectionHeadings) {
    strengths.push("Section headings use ATS-standard terminology");
  } else {
    warnings.push("Use standard section labels: 'Experience', 'Skills', 'Education', 'Projects' — avoid creative labels");
    flags.push("Non-standard section headings detected");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. FORMATTING SAFETY  (max 20 pts)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const noTables = !/(\|\s*.{3,}\s*\|)/.test(resumeText);

  const fancyBulletCount = (resumeText.match(/[★◆✦◉⬛▪❖➢➤]/g) ?? []).length;
  const noFancyBullets   = fancyBulletCount < 3;

  const longLines        = resumeText.split("\n").filter((l) => l.trim().length > 180);
  const noTextBoxSignals = longLines.length < 3;

  let formattingRaw = 0;
  if (noTables) {
    formattingRaw += 8;
    strengths.push("No table structures detected — ATS-safe layout");
  } else {
    warnings.push("Table layout detected — ATS parsers linearise tables and scramble column order; use plain text instead");
    flags.push("Table layout may cause ATS parsing errors");
  }
  if (noFancyBullets) {
    formattingRaw += 6;
  } else {
    warnings.push(`${fancyBulletCount} decorative bullet characters detected — replace with standard hyphens or dots`);
    flags.push("Non-standard bullet characters detected");
  }
  if (noTextBoxSignals) {
    formattingRaw += 6;
  } else {
    warnings.push("Very long unbroken lines detected — may indicate text-box content ATS cannot extract");
    flags.push("Possible text-box content detected");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. CONTENT QUALITY  (max 30 pts)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const wordCount           = resumeText.split(/\s+/).filter(Boolean).length;
  const hasSufficientLength = wordCount >= 300;

  const achievementCount          = countQuantifiedAchievements(resumeText);
  const hasQuantifiedAchievements = achievementCount >= 1;   // was 2 — one good metric is meaningful

  // Calibrated threshold: t1 >= 2 OR combined >= 4 (was t1 >= 3 || combined >= 5)
  const t1Matches      = ACTION_VERBS_T1.filter((v) => lower.includes(v));
  const t2Matches      = ACTION_VERBS_T2.filter((v) => lower.includes(v));
  const hasActionVerbs = t1Matches.length >= 2 || (t1Matches.length + t2Matches.length) >= 4;

  const hasDateFormats = detectDateFormats(resumeText);

  const firstPersonCount = (resumeText.match(/\b(I|me|my|myself|we|our)\b/g) ?? []).length;
  const noFirstPerson    = firstPersonCount < 3;

  const typoFound    = TYPO_PATTERNS.filter(([re]) => re.test(resumeText));
  const noSpellIssues = typoFound.length === 0;

  let contentRaw = 0;
  if (hasSufficientLength) {
    contentRaw += 5;
    strengths.push(`Resume has sufficient content (${wordCount} words)`);
  } else {
    warnings.push(`Resume is too brief (${wordCount} words) — aim for at least 300 words`);
    flags.push(`Resume too short: ${wordCount} words`);
  }
  if (hasQuantifiedAchievements) {
    contentRaw += 10;
    strengths.push(`${achievementCount} quantified achievement${achievementCount > 1 ? "s" : ""} detected`);
  } else {
    warnings.push("No quantified achievements found — add numbers: 'reduced load time by 35%', 'served 5,000+ users'");
    flags.push("No quantified achievements found");
  }
  if (hasActionVerbs) {
    contentRaw += 8;
    const topVerbs = [...t1Matches, ...t2Matches].slice(0, 3);
    strengths.push(`Strong action verbs detected: ${topVerbs.join(", ")}`);
  } else {
    const verbSuggestions = ACTION_VERBS_T1.slice(0, 5).join(", ");
    warnings.push(`Too few action verbs — start every bullet with verbs like: ${verbSuggestions}`);
    flags.push("Insufficient action verbs");
  }
  if (hasDateFormats) {
    contentRaw += 4;
    strengths.push("Date formats are ATS-readable (e.g. Jan 2023, 2021–2023)");
  } else {
    warnings.push("Use ATS-standard date formats: 'Jan 2023', 'September 2021 – Present'");
  }
  if (noFirstPerson) {
    contentRaw += 2;
  } else {
    warnings.push("Avoid first-person pronouns (I, me, my) — use 'Built X' not 'I built X'");
  }
  if (noSpellIssues) {
    contentRaw += 1;
  } else {
    const typoList = typoFound.map(([, fix]) => fix).join(", ");
    warnings.push(`Possible spelling issue${typoFound.length > 1 ? "s" : ""} detected — check: ${typoList}`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. COMPOSITE SCORE
  // Raw points are capped at their respective maximums before summing.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const score = Math.min(
    100,
    Math.round(
      Math.min(contactRaw, CONTACT_MAX) +
      // structureRaw is out of 32, normalise to 30 before adding
      Math.round(Math.min(structureRaw, STRUCTURE_MAX) / STRUCTURE_MAX * 30) +
      Math.min(formattingRaw, FORMATTING_MAX) +
      Math.min(contentRaw, CONTENT_MAX)
    )
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
    flags,
    // Normalise each to 0–100 for UI display
    contactScore:    Math.round((Math.min(contactRaw, CONTACT_MAX) / CONTACT_MAX) * 100),
    structureScore:  Math.round((Math.min(structureRaw, STRUCTURE_MAX) / STRUCTURE_MAX) * 100),
    formattingScore: Math.round((Math.min(formattingRaw, FORMATTING_MAX) / FORMATTING_MAX) * 100),
    contentScore:    Math.round((Math.min(contentRaw, CONTENT_MAX) / CONTENT_MAX) * 100),
  };
}