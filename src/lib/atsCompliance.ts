import { analyzeSections } from "./sectionAnalyzer";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ATSComplianceChecks {
  // Contact
  email: boolean;
  phone: boolean;
  linkedin: boolean;
  github: boolean;
  // Structure
  skillsSection: boolean;
  experienceSection: boolean;
  educationSection: boolean;
  projectsSection: boolean;
  // Content quality
  hasSufficientLength: boolean;
  hasQuantifiedAchievements: boolean;
  hasActionVerbs: boolean;
  noSpellIssues: boolean;
}

export interface ATSComplianceResult {
  score: number;
  checks: ATSComplianceChecks;
  warnings: string[];
  strengths: string[];
  // Breakdown by category for UI display
  contactScore: number;
  structureScore: number;
  contentScore: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Action verbs that signal strong, recruiter-friendly bullet points
const STRONG_ACTION_VERBS = [
  "built", "developed", "designed", "architected", "engineered", "implemented",
  "created", "optimized", "improved", "automated", "deployed", "integrated",
  "led", "managed", "owned", "scaled", "mentored", "delivered", "reduced",
  "increased", "generated", "launched", "migrated", "refactored", "streamlined",
];

// Common resume spelling mistakes — just checks for a handful of the worst offenders
const LIKELY_TYPOS = [
  /\bexperiance\b/i,
  /\bresponsibilties\b/i,
  /\bmanagment\b/i,
  /\bdevelopement\b/i,
  /\bimplmentation\b/i,
  /\baccomplishements\b/i,
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Detects a phone number in any of these formats:
 *   +1 (555) 123-4567   North American with country code
 *   (555) 123-4567      North American without country code
 *   +91 98765 43210     Indian mobile
 *   +44 7911 123456     UK mobile (and other E.164 international)
 */
function detectPhone(text: string): boolean {
  const stripped = text.replace(/[\s\-().]/g, "");
  return (
    /(\+?1)?(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/.test(text) || // North American
    /(\+91)?[6-9]\d{9}/.test(stripped) ||                            // Indian
    /\+[1-9]\d{6,14}/.test(stripped)                                 // General E.164
  );
}

/**
 * Counts unique metric patterns that represent real achievements — not bare
 * years, phone digits, GPA values, or section numbering.
 *
 * Valid:   35%, 10,000 users, 50+ students, $2k revenue, "reduced by 40%"
 * Invalid: 2024, +91 9876543210, 8.5 CGPA, 3rd year
 */
function countQuantifiedAchievements(text: string): number {
  const patterns = [
    /\d+%/g,
    /\d[\d,]*\+/g,
    /\$[\d,]+[km]?/gi,
    /\d[\d,]*\s*(users|customers|clients|students|records|downloads|requests|transactions|sales|leads|bugs|issues|tickets)\b/gi,
    /\b(increased|reduced|improved|boosted|cut|grew|saved|generated|decreased)\b.{0,50}\d+/gi,
  ];

  const all: string[] = [];
  for (const p of patterns) {
    all.push(...(text.match(p) ?? []));
  }

  // Deduplicate
  return new Set(all.map((m) => m.trim().toLowerCase())).size;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function analyzeATSCompliance(resumeText: string): ATSComplianceResult {
  const sections = analyzeSections(resumeText);
  const lower = resumeText.toLowerCase();

  const warnings: string[] = [];
  const strengths: string[] = [];

  // ── Contact checks ────────────────────────────────────────────────────────

  const email = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i.test(resumeText);
  const phone = detectPhone(resumeText);
  const linkedin = /(linkedin\.com\/in\/|linkedin\.com)/i.test(resumeText);
  const github = /(github\.com\/|github\.com)/i.test(resumeText);

  // Contact score: 25 points total
  let contactScore = 0;
  if (email) {
    contactScore += 7;
    strengths.push("Professional email detected");
  } else {
    warnings.push("No email address found — ATS cannot contact you");
  }

  if (phone) {
    contactScore += 6;
    strengths.push("Phone number detected");
  } else {
    warnings.push("No phone number found");
  }

  if (linkedin) {
    contactScore += 6;
    strengths.push("LinkedIn profile URL present");
  } else {
    warnings.push("Add your LinkedIn profile URL (linkedin.com/in/yourname)");
  }

  if (github) {
    contactScore += 6;
    strengths.push("GitHub profile URL present");
  } else {
    warnings.push("Add your GitHub profile URL to showcase your work");
  }

  // ── Structure checks ──────────────────────────────────────────────────────

  const skillsSection     = sections.skills.found;
  const experienceSection = sections.experience.found;
  const educationSection  = sections.education.found;
  const projectsSection   = sections.projects.found;

  // Structure score: 40 points total (experience & skills weighted heavier)
  let structureScore = 0;

  if (skillsSection) {
    structureScore += 10;
    strengths.push("Skills section present — ATS can parse your tech stack");
  } else {
    warnings.push("No Skills section detected — ATS cannot match your keywords");
  }

  if (experienceSection) {
    structureScore += 12;
    strengths.push("Experience section present");
  } else {
    warnings.push("No Experience section — this is critical for most ATS filters");
  }

  if (educationSection) {
    structureScore += 8;
    strengths.push("Education section present");
  } else {
    warnings.push("No Education section found");
  }

  if (projectsSection) {
    structureScore += 10;
    strengths.push("Projects section present — good signal for technical roles");
  } else {
    warnings.push("No Projects section — add one to demonstrate hands-on skills");
  }

  // ── Content quality checks ────────────────────────────────────────────────

  const hasSufficientLength = resumeText.trim().length > 1000;
  const achievementCount    = countQuantifiedAchievements(resumeText);
  const hasQuantifiedAchievements = achievementCount >= 2;

  const actionVerbMatches = STRONG_ACTION_VERBS.filter((v) => lower.includes(v));
  const hasActionVerbs    = actionVerbMatches.length >= 4;

  const spellIssues = LIKELY_TYPOS.filter((re) => re.test(resumeText));
  const noSpellIssues = spellIssues.length === 0;

  // Content score: 35 points total
  let contentScore = 0;

  if (hasSufficientLength) {
    contentScore += 8;
    strengths.push("Resume has sufficient content length");
  } else {
    warnings.push("Resume is too short — aim for at least 400 words");
  }

  if (hasQuantifiedAchievements) {
    contentScore += 12;
    strengths.push(`${achievementCount} quantified achievement${achievementCount > 1 ? "s" : ""} detected`);
  } else {
    warnings.push("Add quantified achievements — e.g. 'reduced load time by 35%' or 'served 5,000+ users'");
  }

  if (hasActionVerbs) {
    contentScore += 10;
    strengths.push(`Strong action verbs detected (${actionVerbMatches.slice(0, 3).join(", ")}…)`);
  } else {
    warnings.push(
      `Too few strong action verbs — start bullet points with words like Built, Developed, Led, Optimized`
    );
  }

  if (noSpellIssues) {
    contentScore += 5;
    // No message for this — silence is fine when passing
  } else {
    warnings.push(
      `Possible spelling issue${spellIssues.length > 1 ? "s" : ""} detected — proofread carefully before applying`
    );
  }

  // ── Total score ───────────────────────────────────────────────────────────

  const score = Math.min(contactScore + structureScore + contentScore, 100);

  return {
    score,
    checks: {
      email,
      phone,
      linkedin,
      github,
      skillsSection,
      experienceSection,
      educationSection,
      projectsSection,
      hasSufficientLength,
      hasQuantifiedAchievements,
      hasActionVerbs,
      noSpellIssues,
    },
    warnings,
    strengths,
    contactScore:   Math.round((contactScore   / 25) * 100),
    structureScore: Math.round((structureScore  / 40) * 100),
    contentScore:   Math.round((contentScore    / 35) * 100),
  };
}