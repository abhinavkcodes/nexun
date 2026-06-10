/**
 * projectAnalyzer.ts
 * Analyses the projects section of a resume.
 *
 * Sub-score breakdown (weighted to produce a final 0–100 score):
 *   technicalDepthScore  (30%) – stack complexity, backend, AI, cloud signals
 *   deploymentScore      (20%) – evidence of real, live, accessible projects
 *   impactScore          (20%) – measurable outcomes (users, performance, downloads)
 *   architectureScore    (20%) – advanced design: auth, queues, caching, distributed
 *   ownershipScore       (10%) – clear builder verbs indicating personal ownership
 */

export interface ProjectAnalysis {
  score: number;

  // Sub-scores (each 0–100)
  technicalDepthScore: number;
  deploymentScore: number;
  impactScore: number;
  architectureScore: number;
  ownershipScore: number;

  strengths: string[];
  weaknesses: string[];
}

// ─── Signal sets ──────────────────────────────────────────────────────────────

/** Core technologies indicating a real, non-trivial stack */
const TECHNICAL_SIGNALS = new Set([
  "api", "rest api", "graphql", "websocket",
  "database", "mongodb", "postgresql", "mysql", "redis", "sqlite",
  "docker", "kubernetes", "aws", "azure", "gcp",
  "authentication", "jwt", "oauth", "session",
  "microservice", "serverless", "lambda",
  "full-stack", "backend", "frontend",
  "typescript", "python", "java", "go", "rust",
]);

/** AI/ML signals — weighted slightly higher as they're in-demand */
const AI_SIGNALS = new Set([
  "openai", "llm", "rag", "langchain", "vector database",
  "embedding", "transformer", "tensorflow", "pytorch",
  "machine learning", "deep learning", "fine-tuning",
  "hugging face", "huggingface", "gemini", "claude",
]);

const DEPLOYMENT_SIGNALS = new Set([
  "github", "vercel", "netlify", "render", "railway", "fly.io",
  "aws", "azure", "gcp", "heroku",
  "deployed", "production", "live demo", "hosted", "live at",
  "app store", "play store", "npm", "pypi",
]);

const ARCHITECTURE_SIGNALS = new Set([
  "authentication", "authorization", "role-based", "rbac",
  "payment", "stripe", "razorpay", "paypal",
  "caching", "redis", "cdn",
  "queue", "rabbitmq", "kafka", "bull",
  "websocket", "real-time", "realtime",
  "scalable", "microservice", "distributed",
  "ci/cd", "github actions", "pipeline",
  "rate limiting", "load balancer", "reverse proxy",
]);

/** Regex for quantified impact — users, stars, downloads, performance */
const IMPACT_RE =
  /(\d[\d,]*\+?\s*(users|customers|students|downloads|stars|requests|transactions|records|issues|bugs|features|teams)|(\d+\.?\d*)\s*%\s*(faster|reduction|improvement|accuracy|uptime|increase|growth)|\d+[km]\+?\s*(users|downloads|requests))/gi;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countSignals(text: string, signals: Set<string>): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const signal of signals) {
    if (lower.includes(signal)) count++;
  }
  return count;
}

function scoreTechnicalDepth(text: string): number {
  const techCount = countSignals(text, TECHNICAL_SIGNALS);
  const aiCount   = countSignals(text, AI_SIGNALS);
  // Each tech signal = 6 pts; AI signals weighted 1.5×; cap at 100
  return Math.min(techCount * 6 + aiCount * 9, 100);
}

function scoreDeployment(text: string): number {
  const count = countSignals(text, DEPLOYMENT_SIGNALS);
  // 1 = 30 (present but minimal), 3+ = 80, 5+ = 100
  if (count === 0) return 0;
  if (count === 1) return 30;
  if (count === 2) return 55;
  if (count <= 4)  return 75;
  return 100;
}

function scoreImpact(text: string): { score: number; count: number } {
  const matches = text.match(IMPACT_RE) ?? [];
  const count = matches.length;
  // 1 match = 40, 3+ = 80, 5+ = 100
  if (count === 0) return { score: 0,   count };
  if (count === 1) return { score: 40,  count };
  if (count === 2) return { score: 60,  count };
  if (count <= 4)  return { score: 80,  count };
  return { score: 100, count };
}

function scoreArchitecture(text: string): number {
  const count = countSignals(text, ARCHITECTURE_SIGNALS);
  return Math.min(count * 20, 100);
}

function scoreOwnership(text: string): number {
  const ownershipRe = /\b(built|created|developed|designed|architected|implemented|launched|shipped|wrote)\b/gi;
  const matches = text.match(ownershipRe) ?? [];
  // Unique verb types matter, not raw repetition
  const unique = new Set(matches.map((m) => m.toLowerCase())).size;
  return Math.min(unique * 20, 100);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function analyzeProject(projectText: string): ProjectAnalysis {
  const technicalDepthScore = scoreTechnicalDepth(projectText);
  const deploymentScore     = scoreDeployment(projectText);
  const { score: impactScore, count: impactCount } = scoreImpact(projectText);
  const architectureScore   = scoreArchitecture(projectText);
  const ownershipScore      = scoreOwnership(projectText);

  // Weighted final score — no magic scale factors
  const score = Math.round(
    technicalDepthScore * 0.30 +
    deploymentScore     * 0.20 +
    impactScore         * 0.20 +
    architectureScore   * 0.20 +
    ownershipScore      * 0.10
  );

  const strengths:  string[] = [];
  const weaknesses: string[] = [];

  // Technical depth
  const techCount = countSignals(projectText, TECHNICAL_SIGNALS);
  const aiCount   = countSignals(projectText, AI_SIGNALS);
  if (techCount >= 6 || aiCount >= 2) {
    strengths.push(
      aiCount >= 2
        ? "Projects showcase modern AI/ML stack alongside strong core tech"
        : "Projects demonstrate strong technical depth and stack complexity"
    );
  } else if (techCount < 3) {
    weaknesses.push("Projects appear technically shallow — add backend, database, or cloud technologies");
  }

  // Deployment
  if (deploymentScore >= 55) {
    strengths.push("Projects are deployed and publicly accessible");
  } else {
    weaknesses.push("No deployment evidence — include live URLs or GitHub repository links");
  }

  // Impact
  if (impactCount >= 3) {
    strengths.push("Projects demonstrate strong measurable impact with specific numbers");
  } else if (impactCount === 0) {
    weaknesses.push("Projects lack measurable outcomes — add user counts, performance gains, or download stats");
  }

  // Architecture
  if (architectureScore >= 60) {
    strengths.push("Projects include advanced architecture (auth, payments, real-time, caching, etc.)");
  } else if (architectureScore < 20) {
    weaknesses.push("Projects lack architectural complexity — consider adding authentication, caching, or async queues");
  }

  return {
    score,
    technicalDepthScore,
    deploymentScore,
    impactScore,
    architectureScore,
    ownershipScore,
    strengths,
    weaknesses,
  };
}