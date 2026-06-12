export interface RoleDetectionResult {
  role: string;
  confidence: number;
  matchedKeywords: string[];
}

// ── Role keyword database ─────────────────────────────────────────────────────
const roleDatabase: Record<string, string[]> = {
  "frontend developer": [
    "react", "next.js", "tailwind", "css", "html", "redux",
    "frontend", "javascript", "typescript", "vue", "angular", "svelte",
  ],
  "backend developer": [
    "node.js", "express", "spring boot", "django", "flask",
    "postgresql", "mongodb", "mysql", "rest api", "backend",
    "fastapi", "graphql", "prisma",
  ],
  "full stack developer": [
    "react", "next.js", "node.js", "express", "mongodb",
    "postgresql", "full-stack", "fullstack", "api", "full stack",
  ],
  "Software engineer": [
  
  "javascript",
  
  "algorithms",
  "data structures",
  "oop",
  "system design",
  "docker",
  "rest api",
  "backend",
  "distributed systems",
  "microservices",
  "kubernetes",
   "system design", "distributed systems", "microservices",
  "algorithms", "data structures", "oop", "low latency",
  "scalability", "object oriented", "concurrency",
],
  "data analyst": [
    "excel", "power bi", "tableau", "sql", "analytics",
    "dashboard", "data analysis", "pandas", "looker", "metabase",
  ],
  "data scientist": [
    "machine learning", "pandas", "numpy", "tensorflow", "pytorch",
    "scikit-learn", "statistics", "jupyter", "feature engineering",
  ],
  "machine learning engineer": [
    "tensorflow", "pytorch", "mlops", "model deployment",
    "machine learning", "feature engineering", "kubeflow", "mlflow",
  ],
  "ai engineer": [
    "llm", "langchain", "rag", "vector database", "openai",
    "prompt engineering", "embedding", "ai", "fine-tuning",
    "hugging face", "transformers",
  ],
"devops engineer": [
  "docker",
  "kubernetes",
  "helm",
  "keda",
  "prometheus",
  "thanos",
  "jenkins",
  "github actions",
  "terraform",
  "ci/cd",
  "ansible",
  "linux",
  "bash",
  "devops",
  "observability",
  "monitoring",
  "cloud infrastructure",
  "infrastructure",
],
  "cloud engineer": [
  "aws",
  "azure",
  "gcp",
  "cloud",
  "cloud infrastructure",
  "kubernetes",
  "helm",
  "terraform",
  "prometheus",
  "thanos",
  "ec2",
  "s3",
  "serverless",
  "iam",
],
"Software engineer (backend/cloud)": [
  "java",
  "docker",
  "kubernetes",
  "helm",
  "prometheus",
  "thanos",
  "backend",
  "rest api",
  "cloud",
  "distributed systems",
],
  "cybersecurity analyst": [
    "penetration testing", "owasp", "burp suite",
    "nmap", "security", "vulnerability", "ethical hacking", "soc",
  ],
  "qa engineer": [
    "selenium", "cypress", "playwright", "testing",
    "automation testing", "qa", "jest", "unit testing",
  ],
  "mobile app developer": [
    "flutter", "react native", "android", "ios",
    "kotlin", "swift", "firebase", "dart",
  ],
  "product manager": [
    "roadmap", "stakeholder", "product strategy",
    "user research", "product management", "agile", "scrum", "jira",
  ],
  "business analyst": [
    "business analysis", "requirements", "stakeholder",
    "process improvement", "documentation", "bpmn", "erp",
    
  ],
};

// ── Per-role bonus weights for high-signal keywords ───────────────────────────
// These are additive to the base keyword count score.
const roleBoosts: Record<string, Record<string, number>> = {
  "frontend developer": {
    react: 2, "next.js": 2, typescript: 1, tailwind: 1,
  },
  "full stack developer": {
    react: 2, "node.js": 2, express: 1, postgresql: 1, mongodb: 1,
  },
  "backend developer": {
    "node.js": 2, express: 2, postgresql: 1, mongodb: 1, django: 1,
  },
  "ai engineer": {
    llm: 3, langchain: 2, rag: 2, openai: 2,
  },
  "data analyst": {
    sql: 2, dashboard: 2, tableau: 2, "power bi": 2,
  },
  "data scientist": {
    "machine learning": 2, pandas: 1, pytorch: 1, tensorflow: 1,
  },
  "devops engineer": {
    docker: 2, kubernetes: 2, "github actions": 2, terraform: 1,
  },
};

// ── Detect the most likely role from resume text ──────────────────────────────
export function detectRole(resumeText: string): RoleDetectionResult {
  const text = resumeText.toLowerCase();

  let bestRole = "Software engineer";
  let bestScore = 0;
  let matchedKeywords: string[] = [];

  for (const [role, keywords] of Object.entries(roleDatabase)) {
    const matches = keywords.filter((kw) => text.includes(kw));
    let score = matches.length;

    // Apply boost weights for high-signal keywords
    const boosts = roleBoosts[role] ?? {};
    for (const [kw, weight] of Object.entries(boosts)) {
      if (text.includes(kw)) score += weight;
    }

   const normalizedScore =
  score / keywords.length;
if (normalizedScore > bestScore) {
      bestScore = normalizedScore;
      bestRole = role;
      matchedKeywords = matches;
    }
  }

  // Confidence = (adjusted score) / (keywords in that role + max possible boost)
  // Cap at 100
  const keywordCount = roleDatabase[bestRole]?.length ?? 1;
  const maxBoost = Object.values(roleBoosts[bestRole] ?? {}).reduce((a, b) => a + b, 0);
  const confidence = Math.min(100, Math.round(bestScore * 100));

  if (confidence < 25) {
    bestRole = "software engineer";
  }
  return {
    role: bestRole,
    confidence,
    matchedKeywords,
  };
}