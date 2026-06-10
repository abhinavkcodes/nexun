/**
 * experienceAnalyzer.ts
 * Analyses the professional experience section of a resume.
 *
 * Sub-score breakdown (all out of 100, weighted to produce a final 0–100 score):
 *   actionVerbScore     (25%) – variety and strength of action verbs
 *   metricsScore        (30%) – quantified impact (numbers, %, scale)
 *   leadershipScore     (20%) – ownership and cross-functional signals
 *   relevanceScore      (15%) – industry/domain signal words
 *   consistencyScore    (10%) – consistent formatting (bullets, dates, roles)
 */

export interface ExperienceAnalysis {
  score: number;

  // Sub-scores (each 0–100)
  actionVerbScore: number;
  metricsScore: number;
  leadershipScore: number;
  relevanceScore: number;
  consistencyScore: number;

  strengths: string[];
  weaknesses: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Tier-1: strong, specific verbs that imply real ownership */
const STRONG_VERBS = new Set([
  "architected", "engineered", "spearheaded", "launched", "automated",
  "optimized", "migrated", "refactored", "scaled", "deployed",
  "built", "designed", "implemented", "reduced", "increased",
  "mentored", "led", "owned", "delivered", "integrated",
]);

/** Tier-2: acceptable but weaker — supported, assisted, helped, etc. */
const WEAK_VERBS = new Set([
  "supported", "assisted", "helped", "worked", "participated",
  "involved", "contributed", "used", "utilized",
]);

const LEADERSHIP_SIGNALS = [
  "led", "managed", "owned", "mentored", "coordinated", "directed",
  "headed", "supervised", "oversaw", "spearheaded", "championed",
  "cross-functional", "stakeholder", "roadmap", "prioritized", "strategy",
];

const RELEVANCE_SIGNALS = [
  "agile", "scrum", "sprint", "kanban", "jira", "confluence",
  "production", "deployment", "ci/cd", "code review", "pull request",
  "a/b test", "unit test", "integration test", "on-call", "incident",
  "dashboard", "pipeline", "api", "microservice", "cloud",
  "sql", "python", "javascript", "typescript", "react", "node",
  "data", "analytics", "automation", "performance", "latency",
  "revenue", "conversion", "retention", "nps",
];

/** Regex for quantified impact: 35%, 10K users, $2M, 3x faster, etc. */
const METRIC_RE =
  /(\d+\.?\d*\s*%|\d[\d,]*\+|\$[\d,]+[km]?|\d+[km]\+?|\d+\s*(users|customers|clients|engineers|developers|teams|projects|requests|transactions|records|rows|countries|languages|features|services|endpoints|apis|dashboards|reports|points|ms|seconds|hours|days)|\d+x\s*(faster|improvement|reduction|increase|growth))/gi;

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function scoreActionVerbs(text: string): { score: number; strongCount: number; weakCount: number } {
  const words = text.toLowerCase().match(/\b\w+\b/g) ?? [];
  let strongCount = 0;
  let weakCount   = 0;
  const seen = new Set<string>();

  for (const word of words) {
    if (STRONG_VERBS.has(word) && !seen.has(word)) { strongCount++; seen.add(word); }
    if (WEAK_VERBS.has(word)   && !seen.has(word)) { weakCount++;   seen.add(word); }
  }

  // Unique strong verbs matter more than repetition
  // 8+ unique strong verbs = 100; each strong = +10, each weak = -5
  const raw = Math.min(strongCount * 10 - weakCount * 3, 100);
  return { score: Math.max(raw, 0), strongCount, weakCount };
}

function scoreMetrics(text: string): { score: number; count: number } {
  const matches = text.match(METRIC_RE) ?? [];
  // 5+ distinct metric occurrences → 100. Each unique match = 18 pts.
  const count = matches.length;
  return { score: Math.min(count * 18, 100), count };
}

function scoreLeadership(text: string): { score: number; signals: string[] } {
  const lower = text.toLowerCase();
  const found = LEADERSHIP_SIGNALS.filter((s) => lower.includes(s));
  // 5+ leadership signals → 100
  return { score: Math.min(found.length * 20, 100), signals: found };
}

function scoreRelevance(text: string): { score: number; signals: string[] } {
  const lower = text.toLowerCase();
  const found = RELEVANCE_SIGNALS.filter((s) => lower.includes(s));
  // 10+ domain signals → 100
  return { score: Math.min(found.length * 10, 100), signals: found };
}

function scoreConsistency(experienceText: string): number {
  const lines = experienceText.split("\n").map((l) => l.trim()).filter(Boolean);
  const bulletLines = lines.filter((l) => /^[•\-*▸►]/.test(l));
  const bulletRatio = bulletLines.length / Math.max(lines.length, 1);

  // Good: >60% of lines are structured bullets
  let score = Math.round(bulletRatio * 80);

  // Bonus: date ranges present (signals complete, professional entries)
  const hasDateRanges = /\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|present|current)/i.test(experienceText);
  if (hasDateRanges) score += 20;

  return Math.min(score, 100);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function analyzeExperience(experienceText: string): ExperienceAnalysis {
  const { score: actionVerbScore, strongCount, weakCount } = scoreActionVerbs(experienceText);
  const { score: metricsScore,    count: metricCount }     = scoreMetrics(experienceText);
  const { score: leadershipScore, signals: leadSignals }   = scoreLeadership(experienceText);
  const { score: relevanceScore }                          = scoreRelevance(experienceText);
  const consistencyScore                                   = scoreConsistency(experienceText);

  // Weighted final score
  const weightedScore = Math.round(
    actionVerbScore  * 0.25 +
    metricsScore     * 0.30 +
    leadershipScore  * 0.20 +
    relevanceScore   * 0.15 +
    consistencyScore * 0.10
  );

  const strengths:  string[] = [];
  const weaknesses: string[] = [];

  // Action verbs
  if (strongCount >= 6) {
    strengths.push("Strong, varied action verbs throughout experience");
  } else if (strongCount >= 3) {
    strengths.push("Good use of action verbs in experience descriptions");
  } else {
    weaknesses.push(
      weakCount > strongCount
        ? "Experience bullets rely on weak verbs (helped, supported, used) — replace with owned, built, led"
        : "Experience bullets lack action verbs — start each bullet with a strong verb"
    );
  }

  // Metrics
  if (metricCount >= 5) {
    strengths.push("Excellent quantification — multiple measurable outcomes across roles");
  } else if (metricCount >= 2) {
    strengths.push("Includes some quantified achievements");
  } else {
    weaknesses.push("Very few or no quantified results — add numbers, percentages, or scale to every bullet");
  }

  // Leadership
  if (leadSignals.length >= 3) {
    strengths.push("Clear leadership and cross-functional ownership signals");
  } else if (leadSignals.length === 0) {
    weaknesses.push("No leadership or ownership language detected — add mentions of team scope, stakeholders, or roadmap ownership");
  }

  // Consistency
  if (consistencyScore >= 80) {
    strengths.push("Well-structured, consistently formatted experience entries");
  } else if (consistencyScore < 50) {
    weaknesses.push("Experience section formatting is inconsistent — use consistent bullet style and include date ranges");
  }

  return {
    score: weightedScore,
    actionVerbScore,
    metricsScore,
    leadershipScore,
    relevanceScore,
    consistencyScore,
    strengths,
    weaknesses,
  };
}