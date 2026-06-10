export interface ProjectAnalysis {
  score: number;

  technicalDepthScore: number;
  deploymentScore: number;
  impactScore: number;
  architectureScore: number;
  ownershipScore: number;

  strengths: string[];
  weaknesses: string[];
}
const TECHNICAL_SIGNALS = [
  "api",
  "rest api",
  "graphql",
  "database",
  "mongodb",
  "postgresql",
  "mysql",
  "redis",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "authentication",
  "jwt",
  "oauth",
  "websocket",
  "microservice",
  "full-stack",
  "backend",
  "frontend"
];
const AI_SIGNALS = [
  "openai",
  "llm",
  "rag",
  "langchain",
  "vector database",
  "embedding",
  "transformer",
  "tensorflow",
  "pytorch",
  "machine learning",
  "deep learning"
];
const DEPLOYMENT_SIGNALS = [
  "github",
  "vercel",
  "netlify",
  "render",
  "railway",
  "aws",
  "azure",
  "gcp",
  "deployed",
  "production",
  "live demo",
  "hosted"
];
const ARCHITECTURE_SIGNALS = [
  "authentication",
  "authorization",
  "role-based access",
  "payment",
  "stripe",
  "caching",
  "queue",
  "websocket",
  "scalable",
  "microservice",
  "distributed"
];
const IMPACT_SIGNALS = [
  "users",
  "students",
  "medicines",
  "records",
  "load time",
  "response time",
  "latency",
  "performance",
];
export function analyzeProject(
    
  projectText: string
): ProjectAnalysis {

  const text =
    projectText.toLowerCase();

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const technicalMatches =
    TECHNICAL_SIGNALS.filter(
      signal =>
        text.includes(signal)
    );

  const deploymentMatches =
    DEPLOYMENT_SIGNALS.filter(
      signal =>
        text.includes(signal)
    );

  const aiMatches =
    AI_SIGNALS.filter(
      signal =>
        text.includes(signal)
    );

  const architectureMatches =
    ARCHITECTURE_SIGNALS.filter(
      signal =>
        text.includes(signal)
    );

  const metricMatches =
    text.match(
      /\d+%|\d+\+|\d+\s(users|customers|clients|downloads)/gi
    ) || [];
const ownershipMatches =
  text.match(
    /\b(built|created|developed|designed|architected|implemented)\b/gi
  ) || [];
  const technicalDepthScore =
  Math.min(
    technicalMatches.length * 5 +
    aiMatches.length * 6,
    50
  );

  const deploymentScore =
  Math.min(
    deploymentMatches.length * 6,
    20
  );

  const architectureScore =
    Math.min(
      architectureMatches.length * 4,
      20
    );

  const impactScore =
  Math.min(
    metricMatches.length * 5,
    15
  );

const ownershipScore =
  Math.min(
    ownershipMatches.length * 5,
    20
  );

const scaleFactor = 1.25;

const score = Math.min(
  Math.round(
    (
      technicalDepthScore +
      deploymentScore +
      architectureScore +
      impactScore +
      ownershipScore
    ) * scaleFactor
  ),
  100
);

  if (
    technicalMatches.length >= 5
  ) {
    strengths.push(
      "Strong technical depth"
    );
  }

  if (
    deploymentMatches.length > 0
  ) {
    strengths.push(
      "Projects appear deployed and accessible"
    );
  } else {
    weaknesses.push(
      "No deployment evidence detected"
    );
  }

  if (
    metricMatches.length >= 2
  ) {
    strengths.push(
      "Projects demonstrate measurable impact"
    );
  } else {
    weaknesses.push(
      "Projects lack measurable outcomes"
    );
  }

  if (
    architectureMatches.length >= 2
  ) {
    strengths.push(
      "Projects include advanced architecture concepts"
    );
  }

  

  return {
  score,

    technicalDepthScore,
    deploymentScore,
    impactScore,
    architectureScore,
ownershipScore,
    strengths,
    weaknesses
  };
}
