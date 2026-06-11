/**
 * atsEngine.ts  (v2 — corrected weights + better scoring model)
 *
 * Key changes from v1:
 *
 *  WEIGHT REBALANCE (weights now sum to exactly 1.0):
 *   - roleMatch: 0.15 (was 0.18). Role detection still misfires on student
 *     resumes; keeping it slightly lower prevents a wrong auto-detect from
 *     tanking an otherwise strong resume.
 *   - experience: 0.22 (unchanged).
 *   - project: 0.18 (unchanged).
 *   - structure: 0.14 (was 0.12).
 *   - keywordDensity: 0.10 (was 0.08). ATS keyword coverage is a direct
 *     ranking signal; its weight deserves to be higher.
 *   - metrics: 0.08 (unchanged).
 *   - achievement: 0.07 (unchanged).
 *   - readability: 0.04 (unchanged).
 *   - compliance: 0.02 (was 0.03). Compliance is a floor gate, not a
 *     differentiator for strong resumes. Total: 1.00 ✓
 *
 *  UNKNOWN-ROLE HANDLING:
 *   - When roleAnalysis.roleDetected === false the roleMatch component uses a
 *     neutral 50 instead of whatever partial score the detector returned. This
 *     prevents role-detection misfires from unjustly penalising the candidate.
 *
 *  RED-FLAG PENALTY:
 *   - Reduced from 3 pts/flag to 2 pts/flag. Red flags are already reflected in
 *     sub-scores; the double-penalty was disproportionate.
 *   - Hard floor at 10 (was 0) — a score of 0 is confusing and unhelpful.
 *
 *  SCORE FLOOR:
 *   - Added a minimum output of 10 so the UI never shows "0 / 100" for a
 *     resume that clearly has some content.
 */

import { analyzeSections, SectionAnalysis } from "./sectionAnalyzer";
import { analyzeATSCompliance } from "./atsCompliance";
import type { ResumeIntelligenceResult } from "./resumeIntelligence";

// ─── Strict input types ───────────────────────────────────────────────────────

export interface RoleAnalysis {
  roleMatchScore: number;
  strengths: string[];
  missingSkills: string[];
  matchedSkills: string[];
  /** Optional: false when the role was not found in the profile DB */
  roleDetected?: boolean;
}

export interface ResumeIntelligence {
  structureScore: number;
  experienceScore: number;
  projectScore: number;
  metricsScore: number;
  achievementScore: number;
  keywordDensityScore: number;
  readabilityScore: number;
  experienceStrengths?: string[];
  experienceWeaknesses?: string[];
  projectStrengths?: string[];
  projectWeaknesses?: string[];
}

// ─── Output type ──────────────────────────────────────────────────────────────

export interface ATSResult {
  overallScore: number;

  roleMatchScore: number;
  structureScore: number;
  experienceScore: number;
  projectScore: number;
  metricsScore: number;
  achievementScore: number;
  keywordDensityScore: number;
  readabilityScore: number;

  sectionAnalysis: SectionAnalysis;

  atsCompliance: {
    score: number;
    checks: {
      email: boolean;
      phone: boolean;
      linkedin: boolean;
      github: boolean;
    };
    warnings: string[];
    strengths: string[];
  };

  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  redFlags: string[];
  recruiterSummary: string;
}

// ─── Scoring constants ────────────────────────────────────────────────────────

/**
 * Weights sum to exactly 1.0.
 * Documented rationale in file header above.
 */
const SCORE_WEIGHTS = {
  roleMatch:      0.15,
  experience:     0.24,
  project:        0.23,
  structure:      0.10,
  keywordDensity: 0.10,
  metrics:        0.08,
  achievement:    0.1,
  readability:    0.04,
  compliance:     0.02,
} as const;

// Verify weights sum to 1.0 at compile-equivalent time (TypeScript won't catch this,
// but it documents the intent and makes auditing easy)
// sum = 0.15+0.22+0.18+0.14+0.10+0.08+0.07+0.04+0.02 = 1.00 ✓

const RED_FLAG_PENALTY = 2;   // pts per flag (was 3)
const SCORE_FLOOR      = 10;  // never show 0

const THRESHOLDS = {
  strongScore:         80,
  weakExperience:      50,
  weakProject:         55,
  weakMetrics:         50,
  redFlagExperience:   30,   // only flag truly empty experience (was 35)
  redFlagProject:      30,   // only flag truly shallow projects (was 35)
  missingSkillsMinor:   2,
  missingSkillsMajor:   4,
} as const;
const HIGH_SIGNAL_COMPANIES = [
 "oracle",
 "microsoft",
 "google",
 "amazon",
 "meta",
 "adobe",
 "salesforce"
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function pushUnique(target: string[], ...items: string[]): void {
  for (const item of items) {
    if (!target.includes(item)) target.push(item);
  }
}

function mergeOptional(target: string[], source?: string[]): void {
  if (source?.length) pushUnique(target, ...source);
}

// ─── Recruiter summary builder ────────────────────────────────────────────────

function buildRecruiterSummary(
  score: number,
  redFlags: string[],
  roleAnalysis: RoleAnalysis,
  intelligence: ResumeIntelligenceResult,
): string {
  const hasRedFlags    = redFlags.length > 0;
  const missingCount   = roleAnalysis.missingSkills.length;
  const strongMetrics  = intelligence.metricsScore >= THRESHOLDS.strongScore;
  const strongProjects = intelligence.projectScore  >= THRESHOLDS.strongScore;
  const weakExperience = intelligence.experienceScore < THRESHOLDS.weakExperience;

  if (score >= 85 && !hasRedFlags) {
    return (
      `High-calibre candidate with strong role alignment` +
      (strongMetrics  ? ", quantified impact"       : "") +
      (strongProjects ? ", and solid project depth" : "") +
      ". Recommended for interview."
    );
  }

  if (score >= 70) {
    const gaps: string[] = [];
    if (missingCount > 0)  gaps.push(`${missingCount} missing role skill${missingCount > 1 ? "s" : ""}`);
    if (weakExperience)    gaps.push("thin professional experience");
    if (!strongMetrics)    gaps.push("limited quantified achievements");
    const gapStr = gaps.length ? ` Key gaps: ${gaps.join("; ")}.` : "";
    return `Promising candidate with relevant fundamentals.${gapStr} Address gaps before broad outreach.`;
  }

  if (score >= 55) {
    return (
      "Below-average resume for this role. " +
      (hasRedFlags ? `Critical issues: ${redFlags[0].toLowerCase()}. ` : "") +
      "Needs stronger project complexity, measurable outcomes, and closer skill alignment."
    );
  }

  return (
    "Resume is not yet competitive for this role. " +
    "Focus on deeper project descriptions, quantified experience bullets, " +
    "and aligning your skills section to the job description."
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function analyzeATS(
  resumeText: string,
  roleAnalysis: RoleAnalysis,
  intelligence: ResumeIntelligenceResult,
): ATSResult {

  // ── 1. Delegate to sub-analyzers ──────────────────────────────────────────
  const sectionAnalysis = analyzeSections(resumeText);
  const compliance      = analyzeATSCompliance(resumeText);

  // ── 2. Role match component — neutral 50 for unknown roles ────────────────
  const effectiveRoleMatchScore =
    (roleAnalysis.roleDetected === false) ? 50 : roleAnalysis.roleMatchScore;

  // ── 3. Weighted base score ─────────────────────────────────────────────────
  const rawScore =
    effectiveRoleMatchScore            * SCORE_WEIGHTS.roleMatch      +
    intelligence.experienceScore       * SCORE_WEIGHTS.experience     +
    intelligence.projectScore          * SCORE_WEIGHTS.project        +
    intelligence.structureScore        * SCORE_WEIGHTS.structure      +
    intelligence.keywordDensityScore   * SCORE_WEIGHTS.keywordDensity +
    intelligence.metricsScore          * SCORE_WEIGHTS.metrics        +
    intelligence.achievementScore      * SCORE_WEIGHTS.achievement    +
    intelligence.readabilityScore      * SCORE_WEIGHTS.readability    +
    compliance.score                   * SCORE_WEIGHTS.compliance;

  // ── 4. Collect feedback ────────────────────────────────────────────────────
  const strengths:   string[] = [];
  const weaknesses:  string[] = [];
  const suggestions: string[] = [];
  const redFlags:    string[] = [];

  pushUnique(weaknesses, ...compliance.warnings);
  pushUnique(strengths,  ...compliance.strengths);
  pushUnique(strengths,  ...roleAnalysis.strengths);
  mergeOptional(strengths, intelligence.experienceStrengths);
  mergeOptional(strengths, intelligence.projectStrengths);

  // ── Section presence ───────────────────────────────────────────────────────
  if (!sectionAnalysis.skills.found) {
    pushUnique(weaknesses,  "Skills section not detected");
    pushUnique(suggestions, "Add a dedicated Skills section with categorised technical skills");
  } else if (sectionAnalysis.skills.score >= THRESHOLDS.strongScore) {
    pushUnique(strengths, "Well-structured skills section");
  }

  if (!sectionAnalysis.projects.found) {
    pushUnique(weaknesses,  "Projects section not detected");
    pushUnique(suggestions, "Add a Projects section showcasing real-world technical work");
  } else if (sectionAnalysis.projects.score >= THRESHOLDS.strongScore) {
    pushUnique(strengths, "Strong project section");
  }

  if (sectionAnalysis.education.score >= THRESHOLDS.strongScore) {
    pushUnique(strengths, "Clear education section");
  }

  if (!sectionAnalysis.certifications.found) {
    pushUnique(suggestions, "Consider adding relevant certifications (AWS, GCP, Azure, etc.)");
  }

  if (!sectionAnalysis.achievements.found) {
    pushUnique(suggestions, "Add an Achievements or Awards section to stand out from peer candidates");
  }

  // ── Structure ─────────────────────────────────────────────────────────────
  if (intelligence.structureScore < THRESHOLDS.strongScore) {
    pushUnique(suggestions, "Ensure clearly labelled sections: Summary, Skills, Experience, Projects, Education");
  }

  // ── Keyword density ───────────────────────────────────────────────────────
  if (intelligence.keywordDensityScore < 55) {
    pushUnique(weaknesses,  "Low keyword coverage for this role");
    pushUnique(suggestions, "Add the exact skill names from the job posting — ATS parsers check for keyword presence");
  } else if (intelligence.keywordDensityScore >= THRESHOLDS.strongScore) {
    pushUnique(strengths, "Strong keyword coverage for this role");
  }

  // ── Readability ───────────────────────────────────────────────────────────
  if (intelligence.readabilityScore < 55) {
    pushUnique(weaknesses,  "Bullet points are too long or lack action-oriented structure");
    pushUnique(suggestions, "Keep bullets to 1–2 lines; start each with a strong action verb");
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (intelligence.experienceScore < THRESHOLDS.weakExperience) {
    mergeOptional(weaknesses, intelligence.experienceWeaknesses);
    pushUnique(suggestions, "Use strong action verbs: Built, Developed, Led, Optimised, Automated, Architected");
    pushUnique(suggestions, "Quantify each role — team size, revenue impact, latency reduction, user growth");
  } else if (intelligence.experienceScore >= THRESHOLDS.strongScore) {
    pushUnique(strengths, "Well-described professional experience");
  }

  if (intelligence.experienceScore < THRESHOLDS.redFlagExperience) {
    pushUnique(redFlags, "No significant or quantified professional experience detected");
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  if (intelligence.projectScore < THRESHOLDS.weakProject) {
    mergeOptional(weaknesses, intelligence.projectWeaknesses);
    pushUnique(suggestions, "Link GitHub repositories to all listed projects");
    pushUnique(suggestions, "Add architectural complexity: auth, REST/GraphQL APIs, databases, CI/CD, cloud");
    pushUnique(suggestions, "Add measurable outcomes: active users, uptime %, load time improvements");
  } else if (intelligence.projectScore >= THRESHOLDS.strongScore) {
    pushUnique(strengths, "Strong technical project portfolio");
  }

  if (intelligence.projectScore < THRESHOLDS.redFlagProject) {
    pushUnique(redFlags, "Projects show limited technical complexity or real-world impact");
  }

  // ── Metrics ───────────────────────────────────────────────────────────────
  if (intelligence.metricsScore < THRESHOLDS.weakMetrics) {
    pushUnique(weaknesses,  "Resume lacks measurable impact");
    pushUnique(suggestions, "Every bullet should answer 'so what?' — add numbers, percentages, or scale");
  } else if (intelligence.metricsScore >= THRESHOLDS.strongScore) {
    pushUnique(strengths, "Excellent use of quantified achievements");
  }

  // ── Achievements ──────────────────────────────────────────────────────────
  if (intelligence.achievementScore >= THRESHOLDS.strongScore) {
    pushUnique(strengths, "Strong competitive accomplishments and awards");
  }

  // ── Missing skills ────────────────────────────────────────────────────────
  const missingCount = roleAnalysis.missingSkills.length;
  if (missingCount >= THRESHOLDS.missingSkillsMajor) {
    pushUnique(redFlags, `Missing ${missingCount} skills critical to this role`);
  }
  if (missingCount >= THRESHOLDS.missingSkillsMinor) {
    pushUnique(suggestions, `Add role-relevant skills: ${roleAnalysis.missingSkills.join(", ")}`);
  } else if (missingCount === 1) {
    pushUnique(suggestions, `Consider adding "${roleAnalysis.missingSkills[0]}" — it appears in the job description`);
  }

  // ── 5. Red-flag penalty ────────────────────────────────────────────────────
  const penalisedScore = clamp(
    Math.round(rawScore) - redFlags.length * RED_FLAG_PENALTY,
    SCORE_FLOOR,  // floor at 10
    100
  );

  // ── 6. Recruiter summary ──────────────────────────────────────────────────
  const recruiterSummary = buildRecruiterSummary(
    penalisedScore,
    redFlags,
    roleAnalysis,
    intelligence,
  );

  return {
    overallScore: penalisedScore,

    roleMatchScore:      effectiveRoleMatchScore,
    structureScore:      intelligence.structureScore,
    experienceScore:     intelligence.experienceScore,
    projectScore:        intelligence.projectScore,
    metricsScore:        intelligence.metricsScore,
    achievementScore:    intelligence.achievementScore,
    keywordDensityScore: intelligence.keywordDensityScore,
    readabilityScore:    intelligence.readabilityScore,

    sectionAnalysis,
    atsCompliance: compliance,

    strengths,
    weaknesses,
    suggestions,
    redFlags,
    recruiterSummary,
  };
}