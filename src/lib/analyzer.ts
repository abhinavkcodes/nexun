const roleSkills: Record<string, string[]> = {
  "frontend developer": [
    "react",
    "next.js",
    "javascript",
    "typescript",
    "html",
    "css",
    "tailwind",
    "git",
  ],

  "backend developer": [
    "node.js",
    "express",
    "mongodb",
    "postgresql",
    "mysql",
    "docker",
    "rest api",
    "git",
  ],
"full stack developer": [
  "react",
  "next.js",
  "node.js",
  "express",
  "postgresql",
  "mongodb",
  "api",
  "git",
],
  "data scientist": [
    "python",
    "sql",
    "pandas",
    "numpy",
    "machine learning",
    "tensorflow",
    "pytorch",
    "aws",
  ],

  "ai engineer": [
    "python",
    "machine learning",
    "langchain",
    "llm",
    "rag",
    "vector database",
    "tensorflow",
    "pytorch",
  ],

  "software engineer": [
    "java",
    "python",
    "javascript",
    "sql",
    "git",
    "data structures",
    "algorithms",
  ],
};

export function analyzeResume(
  resumeText: string,
  role: string
) {
  const skills =
    roleSkills[role.toLowerCase()] || [];

  const resume =
    resumeText.toLowerCase();

  const matchedSkills = skills.filter(
    (skill) =>
      resume.includes(skill)
  );

  const missingSkills = skills.filter(
    (skill) =>
      !resume.includes(skill)
  );

  const roleMatchScore = Math.round(
  (
    matchedSkills.length /
    Math.max(
      skills.length,
      1
    )
  ) * 100
);


  const strengths =
    matchedSkills.map(
      (skill) =>
        `Strong match in ${skill}`
    );

  const suggestions =
    missingSkills.map(
      (skill) =>
        `Consider learning ${skill}`
    );

  return {
  roleMatchScore,
  matchedSkills,
  missingSkills,
  strengths,
  suggestions,
};
}