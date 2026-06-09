export interface ExperienceAnalysis {
  score: number;

  actionVerbScore: number;
  metricsScore: number;
  leadershipScore: number;
  experienceSignalScore: number;

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

  "analyzed",
  "delivered",
  "collaborated",
  "reduced",
  "increased",
  "generated",
  "executed",
  "supported",
  "maintained",
  "tracked",
  "monitored",
  "reported",

  "led",
  "managed",
  "owned",
  "scaled",
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
const EXPERIENCE_SIGNALS = [
  "intern",
  "internship",
  "agile",
  "sprint",
  "dashboard",
  "sql",
  "python",
  "pandas",
  "analytics",
  "analysis",
  "report",
  "automation",
  "stakeholder",
  "business",
  "data accuracy",
  "data quality",
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
    /\d+%|\d+\+|\d+,?\d*|\d+\s(users|customers|clients|projects|rows|reports|dashboards)/gi
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

const experienceSignals =
  EXPERIENCE_SIGNALS.filter(
    signal =>
      text.includes(signal)
  );

const experienceSignalScore =
  Math.min(
    experienceSignals.length * 3,
    20
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
  if (
  experienceSignals.length >= 5
) {
  strengths.push(
    "Strong internship and industry experience signals"
  );
}

  const score =
  actionVerbScore +
  metricsScore +
  leadershipScore +
  experienceSignalScore;

  return {
  score: Math.min(score, 100),

  actionVerbScore,
  metricsScore,
  leadershipScore,
  experienceSignalScore,

  strengths,
  weaknesses
};
}