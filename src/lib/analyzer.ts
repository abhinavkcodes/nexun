export function analyzeResume(
  resumeText: string,
  jobDescription: string
) {
  const skillBank = [
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "express",
    "mongodb",
    "postgresql",
    "mysql",
    "python",
    "java",
    "sql",
    "aws",
    "docker",
    "git",
    "github",
    "rest api",
    "tailwind",
    "machine learning",
    "artificial intelligence",
    "langchain",
    "django",
  ];

  const resume = resumeText.toLowerCase();
  const jd = jobDescription.toLowerCase();

  const matchedSkills = skillBank.filter(
    (skill) =>
      jd.includes(skill) &&
      resume.includes(skill)
  );

  const missingSkills = skillBank.filter(
    (skill) =>
      jd.includes(skill) &&
      !resume.includes(skill)
  );

  const atsScore = Math.round(
    (matchedSkills.length /
      Math.max(
        matchedSkills.length +
          missingSkills.length,
        1
      )) *
      100
  );

  const suggestions = missingSkills.map(
    (skill) =>
      `Consider adding ${skill} experience or projects`
  );

  const strengths = matchedSkills.map(
    (skill) =>
      `Strong match in ${skill}`
  );

  return {
    atsScore,
    matchedSkills,
    missingSkills,
    suggestions,
    strengths,
  };
}