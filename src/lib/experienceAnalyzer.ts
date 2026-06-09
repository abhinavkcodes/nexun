export interface ExperienceAnalysis {
  score: number;

  actionVerbScore: number;
  metricsScore: number;
  leadershipScore: number;

  strengths: string[];
  weaknesses: string[];
}
const ACTION_VERBS = [
  "built",
  "developed",
  "implemented",
  "designed",
  "created",
  "optimized",
  "improved",
  "automated",
  "deployed",
  "engineered",
  "architected",
  "integrated",
  "led",
  "managed",
  "delivered",
  "reduced",
  "increased",
  "scaled",
  "collaborated",
  "mentored"
];
const LEADERSHIP_KEYWORDS = [
  "led",
  "managed",
  "owned",
  "mentored",
  "coordinated",
  "directed",
  "headed",
  "supervised"
];
export function analyzeExperience(
  experienceText: string
): ExperienceAnalysis {

  const text =
    experienceText.toLowerCase();

  let actionVerbScore = 0;
  let metricsScore = 0;
  let leadershipScore = 0;

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const actionMatches =
    ACTION_VERBS.filter(
      verb => text.includes(verb)
    );

  actionVerbScore =
    Math.min(
      actionMatches.length * 4,
      40
    );

  const metricMatches =
    text.match(
      /\d+%|\d+\+|\d+\s(users|customers|clients|projects)/gi
    ) || [];

  metricsScore =
    Math.min(
      metricMatches.length * 10,
      30
    );

  const leadershipMatches =
    LEADERSHIP_KEYWORDS.filter(
      keyword =>
        text.includes(keyword)
    );

  leadershipScore =
    Math.min(
      leadershipMatches.length * 10,
      30
    );

  if (actionMatches.length >= 5) {
    strengths.push(
      "Strong action-oriented experience descriptions"
    );
  } else {
    weaknesses.push(
      "Experience lacks strong action verbs"
    );
  }

  if (metricMatches.length >= 2) {
    strengths.push(
      "Includes measurable impact"
    );
  } else {
    weaknesses.push(
      "Few quantified achievements detected"
    );
  }

  if (leadershipMatches.length > 0) {
    strengths.push(
      "Demonstrates leadership and ownership"
    );
  }

  const score =
    actionVerbScore +
    metricsScore +
    leadershipScore;

  return {
    score: Math.min(score, 100),

    actionVerbScore,
    metricsScore,
    leadershipScore,

    strengths,
    weaknesses
  };
}