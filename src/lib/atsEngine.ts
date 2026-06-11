import { analyzeSections, SectionAnalysis } from "./sectionAnalyzer";
import { analyzeATSCompliance } from "./atsCompliance";
import type { ResumeIntelligenceResult }
from "./resumeIntelligence";

// ─── Strict input types (replace `any` with these) ──────────────────────────

export interface RoleAnalysis {
  roleMatchScore: number;          // 0–100
  strengths: string[];
  missingSkills: string[];
  matchedSkills: string[];
}

export interface ResumeIntelligence {
  structureScore: number;          // 0–100
  experienceScore: number;         // 0–100
  projectScore: number;            // 0–100
  metricsScore: number;            // 0–100
  achievementScore: number;        // 0–100
  keywordDensityScore: number;     // 0–100  (how well resume mirrors JD language)
  readabilityScore: number;        // 0–100  (sentence length, bullet clarity)
  experienceStrengths?: string[];
  experienceWeaknesses?: string[];
  projectStrengths?: string[];
  projectWeaknesses?: string[];
}

// ─── Output type ─────────────────────────────────────────────────────────────

export interface ATSResult {
  overallScore: number;            // 0–100, penalised for red flags

  // Sub-scores (raw, pre-penalty)
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

// ─── Internal scoring constants ───────────────────────────────────────────────

/**
 * Weights must sum to 1.0.
 * Rationale:
 *  - roleMatch is the single most predictive signal for interview conversion
 *  - keywordDensity matters because real ATS parsers rank by keyword frequency
 *  - metrics & achievements are weighted equally and meaningfully
 *  - compliance is a hard floor (missing contact = instant rejection), so 0.05 is fine
 */
const SCORE_WEIGHTS = {
  roleMatch:       0.28,
  experience:      0.18,
  project:         0.15,
  structure:       0.12,
  keywordDensity:  0.10,
  metrics:         0.08,
  achievement:     0.05,
  readability:     0.04,  // tie-breaker; separates near-equal candidates
  compliance:      0.05,  // must-have contacts
} as const;

// Red flag deductions applied to the final score (absolute points)
const RED_FLAG_PENALTY = 5;

// Thresholds
const THRESHOLDS = {
  strongScore:         80,
  weakExperience:      60,
  weakProject:         65,
  weakMetrics:         60,
  redFlagExperience:   45,
  redFlagProject:      45,
  missingSkillsMinor:   2,   // suggestions only
  missingSkillsMajor:   4,   // red flag
} as const;

// ─── Helper utilities ─────────────────────────────────────────────────────────

/** Clamp a number between min and max (inclusive). */
function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** Push items into an array only if they aren't already present. */
function pushUnique(target: string[], ...items: string[]): void {
  for (const item of items) {
    if (!target.includes(item)) target.push(item);
  }
}

/** Safely spread an optional string array into a target, deduplicating. */
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
      (strongMetrics  ? ", quantified impact"   : "") +
      (strongProjects ? ", and solid project depth" : "") +
      `. Recommended for interview.`
    );
  }

  if (score >= 70) {
    const gaps: string[] = [];
    if (missingCount > 0)   gaps.push(`${missingCount} missing role skill${missingCount > 1 ? "s" : ""}`);
    if (weakExperience)     gaps.push("thin professional experience");
    if (!strongMetrics)     gaps.push("limited quantified achievements");
    const gapStr = gaps.length ? ` Key gaps: ${gaps.join("; ")}.` : "";
    return `Promising candidate with relevant fundamentals.${gapStr} Address gaps before broad outreach.`;
  }

  if (score >= 55) {
    return (
      `Below-average resume for this role. ` +
      (hasRedFlags ? `Critical issues: ${redFlags[0].toLowerCase()}. ` : "") +
      `Needs stronger project complexity, measurable outcomes, and closer skill alignment.`
    );
  }

  return (
    `Resume is not competitive for this role. ` +
    `Significant improvements required across experience depth, technical projects, ` +
    `and keyword alignment with the job description.`
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

  // ── 2. Weighted base score ─────────────────────────────────────────────────
  const rawScore =
    roleAnalysis.roleMatchScore          * SCORE_WEIGHTS.roleMatch       +
    intelligence.experienceScore         * SCORE_WEIGHTS.experience      +
    intelligence.projectScore            * SCORE_WEIGHTS.project         +
    intelligence.structureScore          * SCORE_WEIGHTS.structure       +
    intelligence.keywordDensityScore     * SCORE_WEIGHTS.keywordDensity  +
    intelligence.metricsScore            * SCORE_WEIGHTS.metrics         +
    intelligence.achievementScore        * SCORE_WEIGHTS.achievement     +
    intelligence.readabilityScore        * SCORE_WEIGHTS.readability     +
    compliance.score                     * SCORE_WEIGHTS.compliance;

  // ── 3. Collect feedback arrays ────────────────────────────────────────────
  const strengths:   string[] = [];
  const weaknesses:  string[] = [];
  const suggestions: string[] = [];
  const redFlags:    string[] = [];

  // Compliance
  pushUnique(weaknesses,  ...compliance.warnings);
  pushUnique(strengths,   ...compliance.strengths);

  // Role alignment strengths from roleAnalysis
  pushUnique(strengths, ...roleAnalysis.strengths);

  // Intelligence-derived strengths
  mergeOptional(strengths, intelligence.experienceStrengths);
  mergeOptional(strengths, intelligence.projectStrengths);

  // ── Section presence ───────────────────────────────────────────────────────
  if (!sectionAnalysis.skills.found) {
    pushUnique(weaknesses,  "Skills section not detected");
    pushUnique(suggestions, "Add a dedicated Skills section with categorised technical and soft skills");
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
    pushUnique(weaknesses,  "Resume structure needs improvement");
    pushUnique(suggestions, "Ensure clear, consistently labelled sections: Summary, Skills, Experience, Projects, Education, Certifications");
  }

  // ── Keyword density ───────────────────────────────────────────────────────
  if (intelligence.keywordDensityScore < 60) {
    pushUnique(weaknesses,  "Low keyword alignment with job description");
    pushUnique(suggestions, "Mirror the exact terminology from the job posting — ATS parsers rank by keyword frequency");
  } else if (intelligence.keywordDensityScore >= THRESHOLDS.strongScore) {
    pushUnique(strengths, "Strong keyword alignment with job description");
  }

  // ── Readability ───────────────────────────────────────────────────────────
  if (intelligence.readabilityScore < 60) {
    pushUnique(weaknesses,  "Bullet points are too long or lack action-oriented structure");
    pushUnique(suggestions, "Keep bullets to 1–2 lines; start each with a strong action verb (Built, Led, Reduced, Scaled)");
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (intelligence.experienceScore < THRESHOLDS.weakExperience) {
    mergeOptional(weaknesses, intelligence.experienceWeaknesses);
    pushUnique(suggestions, "Use strong action verbs: Built, Developed, Led, Optimised, Automated, Architected");
    pushUnique(suggestions, "Quantify each role with metrics — team size, revenue impact, latency reduction, user growth");
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
    pushUnique(suggestions, "Demonstrate complexity: authentication, REST/GraphQL APIs, databases, CI/CD, cloud deployment");
    pushUnique(suggestions, "Add measurable outcomes: active users, uptime %, load time improvements, downloads");
  } else if (intelligence.projectScore >= THRESHOLDS.strongScore) {
    pushUnique(strengths, "Strong technical project portfolio");
  }

  if (intelligence.projectScore < THRESHOLDS.redFlagProject) {
    pushUnique(redFlags, "Projects show limited technical complexity or real-world impact");
  }

  // ── Metrics ───────────────────────────────────────────────────────────────
  if (intelligence.metricsScore < THRESHOLDS.weakMetrics) {
    pushUnique(weaknesses,  "Resume lacks measurable impact");
    pushUnique(suggestions, "Every bullet should answer 'so what?' — add numbers, percentages, or scale (users, requests/sec, cost savings)");
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
    pushUnique(suggestions, `Add role-relevant skills to your Skills section: ${roleAnalysis.missingSkills.join(", ")}`);
  } else if (missingCount === 1) {
    pushUnique(suggestions, `Consider adding "${roleAnalysis.missingSkills[0]}" — it appears in the job description`);
  }

  // ── 4. Red-flag penalty (5 pts per flag, floor at 0) ──────────────────────
  const penalisedScore = clamp(Math.round(rawScore) - redFlags.length * RED_FLAG_PENALTY);

  // ── 5. Recruiter summary ──────────────────────────────────────────────────
  const recruiterSummary = buildRecruiterSummary(
    penalisedScore,
    redFlags,
    roleAnalysis,
    intelligence,
  );

  // ── 6. Return ─────────────────────────────────────────────────────────────
  return {
    overallScore: penalisedScore,

    roleMatchScore:      roleAnalysis.roleMatchScore,
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