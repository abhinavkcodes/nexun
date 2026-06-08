export interface RoleDetectionResult {
  role: string;
  confidence: number;
  matchedKeywords: string[];
}

const roleDatabase: Record<
  string,
  string[]
> = {
  "frontend developer": [
    "react",
    "next.js",
    "tailwind",
    "css",
    "html",
    "redux",
    "frontend",
    "javascript",
    "typescript",
  ],

  "backend developer": [
    "node.js",
    "express",
    "spring boot",
    "django",
    "flask",
    "postgresql",
    "mongodb",
    "mysql",
    "rest api",
    "backend",
  ],

  "full stack developer": [
    "react",
    "next.js",
    "node.js",
    "express",
    "mongodb",
    "postgresql",
    "full-stack",
    "api",
  ],

  "software engineer": [
    "java",
    "python",
    "javascript",
    "sql",
    "git",
    "algorithms",
    "data structures",
    "oop",
  ],

  "data analyst": [
    "excel",
    "power bi",
    "tableau",
    "sql",
    "analytics",
    "dashboard",
    "data analysis",
    "pandas",
  ],

  "data scientist": [
    "machine learning",
    "pandas",
    "numpy",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "statistics",
  ],

  "machine learning engineer": [
    "tensorflow",
    "pytorch",
    "mlops",
    "model deployment",
    "machine learning",
    "feature engineering",
  ],

  "ai engineer": [
    "llm",
    "langchain",
    "rag",
    "vector database",
    "openai",
    "prompt engineering",
    "embedding",
    "ai",
  ],

  "devops engineer": [
    "docker",
    "kubernetes",
    "jenkins",
    "github actions",
    "terraform",
    "ci/cd",
  ],

  "cloud engineer": [
    "aws",
    "azure",
    "gcp",
    "cloud",
    "lambda",
    "ec2",
    "s3",
  ],

  "cybersecurity analyst": [
    "penetration testing",
    "owasp",
    "burp suite",
    "nmap",
    "security",
    "vulnerability",
  ],

  "qa engineer": [
    "selenium",
    "cypress",
    "playwright",
    "testing",
    "automation testing",
    "qa",
  ],

  "mobile app developer": [
    "flutter",
    "react native",
    "android",
    "ios",
    "kotlin",
    "swift",
  ],

  "product manager": [
    "roadmap",
    "stakeholder",
    "product strategy",
    "user research",
    "product management",
  ],

  "business analyst": [
    "business analysis",
    "requirements",
    "stakeholder",
    "process improvement",
    "documentation",
  ],
};

export function detectRole(
  resumeText: string
): RoleDetectionResult {
  const text =
    resumeText.toLowerCase();

  let bestRole =
    "software engineer";

  let bestScore = 0;

  let matchedKeywords: string[] =
    [];

  for (const [
    role,
    keywords,
  ] of Object.entries(
    roleDatabase
  )) {
    const matches =
      keywords.filter(
        (keyword) =>
          text.includes(keyword)
      );

    const score =
      matches.length;

    if (score > bestScore) {
      bestScore = score;
      bestRole = role;
      matchedKeywords =
        matches;
    }
  }

  const confidence =
    Math.min(
      100,
      Math.round(
        (bestScore /
          Math.max(
            roleDatabase[
              bestRole
            ].length,
            1
          )) *
          100
      )
    );

  return {
    role: bestRole,
    confidence,
    matchedKeywords,
  };
}