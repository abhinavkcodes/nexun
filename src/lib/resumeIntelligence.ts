import { analyzeExperience } from "./experienceAnalyzer";
import { analyzeSections } from "./sectionAnalyzer";
import { analyzeProject } from "./projectAnalyzer";

export function analyzeResumeIntelligence(resumeText: string) {
  const text = resumeText.toLowerCase();

  const sections = analyzeSections(resumeText);
  const experienceAnalysis = analyzeExperience(sections.experience.content);
  const projectAnalysis = analyzeProject(sections.projects.content);

  const experienceScore = experienceAnalysis.score;
  const projectScore = projectAnalysis.score;

  // ── Structure score ─────────────────────────────────────────────────────────
  const hasSkills        = sections.skills.found;
  const hasProjects      = sections.projects.found;
  const hasExperience    = sections.experience.found;
  const hasEducation     = sections.education.found;
  const hasCertifications = sections.certifications.found;
  const hasAchievements  = sections.achievements.found;

  let structureScore = 0;
  if (hasSkills)          structureScore += 15;
  if (hasProjects)        structureScore += 20;
  if (hasExperience)      structureScore += 25;
  if (hasEducation)       structureScore += 15;
  if (hasCertifications)  structureScore += 10;
  if (hasAchievements)    structureScore += 15;
  structureScore = Math.min(structureScore, 100);

  // ── Metrics score ───────────────────────────────────────────────────────────
  // Only match patterns that represent real achievements, not bare numbers,
  // phone digits, years, or GPA values.
  //
  // Valid:   "35%", "10,000 users", "50+ students", "$2k revenue"
  // Invalid: "2024", "+91 9876543210", "8.5 CGPA", "3rd year"
  const metricPatterns = [
    /\d+%/g,                             // percentages: 35%, 99%
    /\d[\d,]*\+/g,                       // "100+", "1,000+"
    /\$[\d,]+/g,                         // dollar amounts
    /\d[\d,]*\s*(users|customers|clients|students|records|downloads|requests|projects|transactions|sales|leads|tickets|bugs|issues|lines of code|loc)\b/gi,
    /\b(increased|reduced|improved|boosted|cut|grew|saved|generated)\b.{0,40}\d+/gi,
  ];

  const allMetricMatches: string[] = [];
  for (const pattern of metricPatterns) {
    const found = resumeText.match(pattern) ?? [];
    allMetricMatches.push(...found);
  }

  // Deduplicate by trimming and lowercasing
  const uniqueMetrics = [...new Set(allMetricMatches.map((m) => m.trim().toLowerCase()))];
  const metricsScore = Math.min(100, uniqueMetrics.length * 12);

  // ── Achievement score ───────────────────────────────────────────────────────
  const achievementKeywords = [
    "winner", "won", "hackathon", "rank", "ranked", "top",
    "award", "icpc", "olympiad", "scholarship", "merit",
    "gold", "silver", "bronze", "finalist", "champion",
  ];
  const achievementMatches = achievementKeywords.filter((word) =>
    text.includes(word)
  ).length;
  const achievementScore = Math.min(100, achievementMatches * 20);

  // ── Readability score ───────────────────────────────────────────────────────
  // Based on avg sentence length, bullet usage, and section organisation.
  const sentences = resumeText.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const avgWordsPerSentence =
    sentences.length > 0
      ? sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length
      : 20;

  const bulletCount = (resumeText.match(/[-•*▸►✓]/g) ?? []).length;
  let readabilityScore = 60;
  if (avgWordsPerSentence < 20)  readabilityScore += 15; // concise bullets
  if (avgWordsPerSentence < 15)  readabilityScore += 10;
  if (bulletCount >= 10)         readabilityScore += 10;
  if (structureScore >= 70)      readabilityScore += 10; // well organised
  if (resumeText.length > 1500)  readabilityScore += 5;
  readabilityScore = Math.min(readabilityScore, 100);
  // ── Reading grade level ──────────────────────────────────

const totalWords =
  resumeText.split(/\s+/).filter(Boolean).length;

const totalSentences =
  Math.max(
    sentences.length,
    1
  );

const syllables = resumeText
  .toLowerCase()
  .split(/\s+/)
  .reduce((count, word) => {
    const matches =
      word.match(/[aeiouy]{1,2}/g);

    return count + Math.max(1, matches?.length || 1);
  }, 0);

const readingGradeLevel =
  0.39 * (totalWords / totalSentences) +
  11.8 * (syllables / totalWords) -
  15.59;

  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

// Heuristic: ~500 words/page
const pageCount = Math.max(
  1,
  Math.ceil(wordCount / 500)
);

let resumeLengthStatus: "good" | "warning" | "long" = "good";

if (pageCount > 2) {
  resumeLengthStatus = "long";
} else if (pageCount === 2) {
  resumeLengthStatus = "warning";
}
  // ── Overall quality ─────────────────────────────────────────────────────────
  const resumeQualityScore = Math.round(
    structureScore    * 0.25 +
    experienceScore   * 0.20 +
    projectScore      * 0.20 +
    metricsScore      * 0.15 +
    achievementScore  * 0.20
  );
  const keywordDensityScore = 0;
return {
  structureScore,
  experienceScore,
  projectScore,
  metricsScore,
  achievementScore,

  keywordDensityScore,

  resumeQualityScore,

  readabilityScore,

  readingGradeLevel,

  wordCount,

  pageCount,

  resumeLengthStatus,

  metricsFound: uniqueMetrics.length,

  experienceStrengths:
    experienceAnalysis.strengths,

  experienceWeaknesses:
    experienceAnalysis.weaknesses,

  projectStrengths:
    projectAnalysis.strengths,

  projectWeaknesses:
    projectAnalysis.weaknesses,
};
}