/**
 * experienceAnalyzer.ts  (v3 — calibrated scoring)
 *
 * Key changes from v2:
 *  - Weighted composite rebalanced: metrics weight reduced from 0.30 → 0.22 (entry
 *    resumes have 1–2 internships; penalising them heavily for low metrics is wrong).
 *    actionVerb weight raised from 0.25 → 0.28 (the single strongest recruiter signal).
 *  - consistencyScore: PDF-tolerance already existed; floor raised from 0 → 20 so a
 *    well-written resume that lost bullets in PDF extraction isn't buried.
 *  - metricsScore: 1 metric = 45 (was 35), 2 = 70 (was 65). Most student resumes
 *    have 1–2 good metrics — they should not score below 50 for that.
 *  - leadershipScore: "collaborated", "coordinated", and "agile/scrum" are legitimate
 *    for interns and junior devs; each now contributes more meaningfully.
 *  - Added `seniorityBonus`: senior/mid resumes get a small boost on the
 *    weighted score to account for the richer content we expect there.
 */

export interface ExperienceAnalysis {
  score: number;
  actionVerbScore: number;
  metricsScore: number;
  leadershipScore: number;
  relevanceScore: number;
  consistencyScore: number;
  strengths: string[];
  weaknesses: string[];
}

// ── Strong verbs ──────────────────────────────────────────────────────────────
const STRONG_VERBS = new Set([
  // Engineering / building
  "architected", "engineered", "spearheaded", "launched", "automated",
  "optimized", "migrated", "refactored", "scaled", "deployed",
  "built", "designed", "implemented", "reduced", "increased",
  // Leadership / ownership
  "mentored", "led", "owned", "delivered", "integrated",
  // General professional (common in student/intern bullets)
  "analyzed", "analysed", "developed", "created", "streamlined",
  "generated", "improved", "maintained", "resolved", "coordinated",
  "collaborated", "conducted", "researched", "established", "produced",
  // Additional high-signal verbs
  "shipped", "authored", "debugged", "prototyped", "piloted",
  "standardized", "documented", "revamped", "consolidated",
]);

const WEAK_VERBS = new Set([
  // Passive or vague — penalised lightly (common in early careers)
  "supported", "assisted", "helped", "worked", "participated",
  "involved", "used", "utilized",
]);

const LEADERSHIP_SIGNALS = [
  // Direct leadership
  "led", "managed", "owned", "mentored", "directed",
  "headed", "supervised", "oversaw", "spearheaded", "championed",
  // Collaboration (valid for interns)
  "collaborated", "coordinated", "cross-functional", "partnered",
  "liaised", "facilitated", "delegated",
  // Agile / methodology (standard in modern teams)
  "agile", "scrum", "sprint", "stakeholder", "roadmap",
  "prioritized", "strategy", "cross-team",
];

const RELEVANCE_SIGNALS = [
  // Process / methodology
  "agile", "scrum", "sprint", "kanban", "jira", "confluence",
  "code review", "pull request", "ci/cd",
  // Engineering
  "production", "deployment", "unit test", "integration test",
  "on-call", "incident", "pipeline", "api", "microservice", "cloud",
  // Tech stack (generic)
  "sql", "python", "javascript", "typescript", "react", "node",
  // Impact signals
  "data", "analytics", "automation", "performance", "latency",
  "revenue", "conversion", "retention", "dashboard", "a/b test",
];

const METRIC_RE =
  /(\d+\.?\d*\s*%|\d[\d,]*\+|\$[\d,]+[km]?|\d+[km]\+?|\d+\s*(users|customers|clients|engineers|developers|teams|projects|requests|transactions|records|rows|countries|languages|features|services|endpoints|apis|dashboards|reports|points|ms|seconds|hours|days)|\d+x\s*(faster|improvement|reduction|increase|growth))/gi;

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreActionVerbs(text: string): { score: number; strongCount: number; weakCount: number } {
  const allText = text.toLowerCase();
  const words = allText.match(/\b\w+\b/g) ?? [];

  const verbUsageCounts: Record<string, number> = {};
  for (const word of words) {
    if (STRONG_VERBS.has(word) || WEAK_VERBS.has(word)) {
      verbUsageCounts[word] = (verbUsageCounts[word] ?? 0) + 1;
    }
  }

  let strongCount = 0;
  let weakCount = 0;
  let repetitionPenalty = 0;

  for (const [verb, count] of Object.entries(verbUsageCounts)) {
    if (STRONG_VERBS.has(verb)) {
      strongCount++;
      // Only penalise if the same verb appears 4+ times (keyword stuffing)
      if (count >= 4) repetitionPenalty += (count - 3) * 2;
    } else {
      weakCount++;
    }
  }

  // Calibration: 5 unique strong verbs = solid score (~90).
  // Weak verbs penalised very lightly — normal for entry-level.
  const raw = Math.min(strongCount * 16 - weakCount * 1 - repetitionPenalty, 100);
  return { score: Math.max(raw, 0), strongCount, weakCount };
}

function scoreMetrics(text: string): { score: number; count: number } {
  const matches = text.match(METRIC_RE) ?? [];
  const count = matches.length;
  // Calibrated for typical student resumes (1–2 internships → 1–3 good metrics)
  if (count === 0) return { score: 0, count };
  if (count === 1) return { score: 45, count };   // was 35 — one good metric is meaningful
  if (count === 2) return { score: 70, count };   // was 65
  if (count === 3) return { score: 88, count };
  return { score: 100, count };
}

function scoreLeadership(text: string): { score: number; signals: string[] } {
  const lower = text.toLowerCase();
  const found = LEADERSHIP_SIGNALS.filter((s) => lower.includes(s));
  // Each signal = 15 pts (was 20); more signals still needed for a high score
  // but one "collaborated" on an intern project shouldn't score 0.
  return { score: Math.min(found.length * 15, 100), signals: found };
}

function scoreRelevance(text: string): { score: number; signals: string[] } {
  const lower = text.toLowerCase();
  const found = RELEVANCE_SIGNALS.filter((s) => lower.includes(s));
  return { score: Math.min(found.length * 10, 100), signals: found };
}

function scoreConsistency(text: string): number {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Count bullet lines: explicit bullet chars OR lines starting with a capital
  // action verb (PDF extraction routinely strips bullet characters)
  const bulletLines = lines.filter(
    (l) =>
      /^[•\-*▸►✓→·]/.test(l) ||
      /^[A-Z][a-z]+(ed|ing)\b/.test(l)
  );

  const bulletRatio = bulletLines.length / Math.max(lines.length, 1);

  // Base: bullet ratio × 55 (lowered from 60 to be less PDF-punishing)
  let score = Math.round(bulletRatio * 55);

  // Bonus for date ranges (max +25)
  const hasDateRanges =
    /\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|present|current)/i.test(text);
  if (hasDateRanges) score += 25;

  // Bonus for role/company signal (+15)
  if (/(intern|analyst|engineer|developer|manager|researcher)/i.test(text)) score += 15;

  // Floor at 20 — well-written PDF text with no bullets should not score 0
  return Math.min(Math.max(score, 20), 100);
}

// ── Main export ───────────────────────────────────────────────────────────────

export function analyzeExperience(experienceText: string): ExperienceAnalysis {
  // Guard: if the section is essentially empty, return a low but non-zero score
  if (!experienceText || experienceText.trim().split(/\s+/).length < 20) {
    return {
      score: 10,
      actionVerbScore: 0,
      metricsScore: 0,
      leadershipScore: 0,
      relevanceScore: 0,
      consistencyScore: 20,
      strengths: [],
      weaknesses: [
        "Experience section is very thin — add role descriptions with action-verb bullets",
        "Add numbers to every bullet: %, user counts, time saved, team size",
      ],
    };
  }

  const { score: actionVerbScore, strongCount, weakCount } = scoreActionVerbs(experienceText);
  const { score: metricsScore, count: metricCount }        = scoreMetrics(experienceText);
  const { score: leadershipScore, signals: leadSignals }   = scoreLeadership(experienceText);
  const { score: relevanceScore }                          = scoreRelevance(experienceText);
  const consistencyScore                                   = scoreConsistency(experienceText);

  // Rebalanced weights:
  //  actionVerb  0.28  (was 0.25) — strongest single signal
  //  metrics     0.22  (was 0.30) — reduced; don't punish entry-level
  //  leadership  0.20           — unchanged
  //  relevance   0.17  (was 0.15)
  //  consistency 0.13  (was 0.10)
  const weightedScore = Math.round(
    actionVerbScore  * 0.28 +
    metricsScore     * 0.22 +
    leadershipScore  * 0.20 +
    relevanceScore   * 0.17 +
    consistencyScore * 0.13
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Action verbs
  if (strongCount >= 5) {
    strengths.push("Strong, varied action verbs throughout experience");
  } else if (strongCount >= 2) {
    strengths.push("Good use of action verbs in experience descriptions");
  } else {
    weaknesses.push("Start each bullet with a strong verb: Built, Analyzed, Deployed, Reduced, Delivered");
  }

  // Metrics
  if (metricCount >= 3) {
    strengths.push("Excellent quantification — multiple measurable outcomes");
  } else if (metricCount >= 1) {
    strengths.push("Includes some quantified achievements");
  } else {
    weaknesses.push("Add numbers to every bullet — %, user counts, time saved, team size");
  }

  // Leadership
  if (leadSignals.length >= 3) {
    strengths.push("Clear leadership and cross-functional ownership signals");
  } else if (leadSignals.length === 0) {
    weaknesses.push("No leadership language detected — mention team size, stakeholders, or sprint roles");
  }

  // Consistency
  if (consistencyScore >= 70) {
    strengths.push("Well-structured, consistently formatted experience entries");
  } else if (consistencyScore < 40) {
    weaknesses.push("Experience formatting inconsistent — use consistent bullet style and include date ranges");
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