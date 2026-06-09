import {
  analyzeExperience
} from "./experienceAnalyzer";

import {
  analyzeSections
} from "./sectionAnalyzer";
import {
  analyzeProject
} from "./projectAnalyzer";
export function analyzeResumeIntelligence(
  resumeText: string
) {
  const text = resumeText.toLowerCase();
const sections =
  analyzeSections(
    resumeText
  );

const experienceAnalysis =
  analyzeExperience(
    sections.experience.content
  );
  const experienceScore =
  experienceAnalysis.score;
  const projectAnalysis =
  analyzeProject(
    sections.projects.content
  );

const projectScore =
  projectAnalysis.score;
  const hasSkills =
    text.includes("skills");

  const hasProjects =
    text.includes("projects");

  const hasExperience =
    text.includes("experience") ||
    text.includes(
      "professional experience"
    );

  const hasEducation =
    text.includes("education");

  const hasCertifications =
    text.includes("certifications");

  const hasAchievements =
    text.includes("achievements");

  let structureScore = 0;

 if (hasSkills) structureScore += 15;
if (hasProjects) structureScore += 20;
if (hasExperience) structureScore += 25;
if (hasEducation) structureScore += 15;
if (hasCertifications) structureScore += 10;
if (hasAchievements) structureScore += 15;

  structureScore = Math.min(
    structureScore,
    100
  );

  

  const metrics =
    resumeText.match(
      /\d+%|\d+\+|\d+,?\d*/g
    ) || [];

  const metricsScore =
  Math.min(
    100,
    metrics.length * 2
  );

  const achievementKeywords = [
    "winner",
    "won",
    "hackathon",
    "rank",
    "top",
    "award",
    "icpc",
  ];

  const achievementMatches =
    achievementKeywords.filter(
      (word) =>
        text.includes(word)
    ).length;

  const achievementScore =
    Math.min(
      100,
      achievementMatches * 20
    );

  const resumeQualityScore =
    Math.round(
      structureScore * 0.25 +
      experienceScore * 0.20 +
      projectScore * 0.20 +
      metricsScore * 0.15 +
      achievementScore * 0.20
    );

  return {
    structureScore,
    experienceScore,
    projectScore,
    metricsScore,
    achievementScore,
    resumeQualityScore,
    metricsFound:
      metrics.length,
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