/**
 * analyzer.ts
 * Role-match analysis: maps resume text against a role's required skill set,
 * computes a roleMatchScore, and produces a keywordDensityScore that reflects
 * how well the resume mirrors the language of the job description.
 */

// ─── Skill alias map ──────────────────────────────────────────────────────────
// Every entry maps a canonical skill name → all accepted variants.
// Keep variants lowercase; matching is done on lowercased resume text.
const SKILL_ALIASES: Record<string, string[]> = {
  // JavaScript ecosystem
  javascript:           ["javascript", "js", "es6", "es2015", "ecmascript"],
  typescript:           ["typescript", "ts"],
  react:                ["react", "react.js", "reactjs"],
  "next.js":            ["next.js", "nextjs", "next js"],
  "node.js":            ["node.js", "nodejs", "node js"],
  express:              ["express", "express.js", "expressjs"],
  vue:                  ["vue", "vue.js", "vuejs"],
  angular:              ["angular", "angularjs"],
  // CSS / Styling
  css:                  ["css", "css3", "scss", "sass", "less", "styled-components"],
  tailwind:             ["tailwind", "tailwindcss", "tailwind css"],
  html:                 ["html", "html5"],
  // Databases
  postgresql:           ["postgresql", "postgres", "pg", "psql"],
  mongodb:              ["mongodb", "mongo"],
  mysql:                ["mysql", "mariadb"],
  redis:                ["redis"],
  sqlite:               ["sqlite"],
  // Python ecosystem
  python:               ["python", "python3"],
  pandas:               ["pandas", "pd"],
  numpy:                ["numpy", "np"],
  fastapi:              ["fastapi", "fast api"],
  flask:                ["flask"],
  django:               ["django"],
  // ML / AI
  tensorflow:           ["tensorflow", "tf", "keras"],
  pytorch:              ["pytorch", "torch"],
  "machine learning":   ["machine learning", "ml", "sklearn", "scikit-learn", "scikit learn"],
  langchain:            ["langchain", "lang chain"],
  llm:                  ["llm", "large language model", "large language models"],
  rag:                  ["rag", "retrieval augmented generation", "retrieval-augmented"],
  "vector database":    ["vector database", "vector db", "pinecone", "weaviate", "qdrant", "chroma"],
  "computer vision":    ["computer vision", "cv", "opencv", "image processing"],
  // Cloud / DevOps / Infra
  aws:                  ["aws", "amazon web services", "amazon aws", "ec2", "s3", "lambda"],
  gcp:                  ["gcp", "google cloud", "google cloud platform"],
  azure:                ["azure", "microsoft azure"],
  docker:               ["docker", "containerization", "containers"],
  kubernetes:           ["kubernetes", "k8s"],
  "ci/cd":              ["ci/cd", "cicd", "github actions", "jenkins", "gitlab ci", "circleci"],
  linux:                ["linux", "unix", "bash", "shell scripting"],
  git:                  ["git", "github", "gitlab", "bitbucket", "version control"],
  // General CS
  sql:                  ["sql", "t-sql", "pl/sql"],
  java:                 ["java"],
  "spring boot":        ["spring boot", "spring", "spring framework"],
  "c++":                ["c++", "cpp"],
  "c#":                 ["c#", "csharp", ".net"],
  "rest api":           ["rest api", "restful api", "rest apis", "restful", "api development"],
  graphql:              ["graphql", "graph ql"],
  "data structures":    ["data structures", "dsa"],
  algorithms:           ["algorithms", "algo", "dsa"],
  websocket:            ["websocket", "websockets", "socket.io"],
  // Analytics
  excel:                ["excel", "microsoft excel", "spreadsheet"],
  tableau:              ["tableau"],
  "power bi":           ["power bi", "powerbi"],
};

// ─── Role profiles ────────────────────────────────────────────────────────────
// Each role has required skills (must-have) and preferred skills (nice-to-have).
// Score = (required matches × 0.7 + preferred matches × 0.3) normalised to 100.
interface RoleProfile {
  required: string[];
  preferred: string[];
}

const ROLE_PROFILES: Record<string, RoleProfile> = {
  "frontend developer": {
    required:  ["react", "javascript", "typescript", "html", "css", "git"],
    preferred: ["next.js", "tailwind", "graphql", "vue", "angular"],
  },
  "backend developer": {
    required:  ["node.js", "express", "postgresql", "rest api", "git", "docker"],
    preferred: ["mongodb", "redis", "kubernetes", "aws", "graphql"],
  },
  "full stack developer": {
    required:  ["react", "node.js", "express", "postgresql", "rest api", "git"],
    preferred: ["next.js", "typescript", "docker", "mongodb", "redis", "aws"],
  },
  "data scientist": {
    required:  ["python", "sql", "pandas", "numpy", "machine learning"],
    preferred: ["tensorflow", "pytorch", "aws", "tableau", "power bi"],
  },
  "ai engineer": {
    required:  ["python", "machine learning", "langchain", "llm", "rag"],
    preferred: ["vector database", "tensorflow", "pytorch", "docker", "aws", "fastapi"],
  },
  "software engineer": {
    required:  ["git", "data structures", "algorithms", "sql"],
    preferred: ["java", "python", "javascript", "docker", "aws", "c++"],
  },
  "data analyst": {
    required:  ["sql", "python", "excel", "pandas"],
    preferred: ["tableau", "power bi", "mongodb", "aws"],
  },
  "devops engineer": {
    required:  ["docker", "kubernetes", "aws", "git", "linux", "ci/cd"],
    preferred: ["gcp", "azure", "python", "terraform"],
  },
  "machine learning engineer": {
    required:  ["python", "tensorflow", "pytorch", "machine learning", "docker"],
    preferred: ["aws", "kubernetes", "fastapi", "rag", "vector database"],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAliases(skill: string): string[] {
  return SKILL_ALIASES[skill] ?? [skill.toLowerCase()];
}

function resumeHasSkill(resumeLower: string, skill: string): boolean {
  return getAliases(skill).some((alias) => resumeLower.includes(alias));
}

/**
 * Keyword density score: measures how saturated the resume is with role-relevant
 * terms. Counts every alias occurrence (not just presence), normalised to 100.
 * This approximates what real ATS parsers do when ranking candidates.
 */
function computeKeywordDensityScore(
  resumeLower: string,
  profile: RoleProfile
): number {
  const allSkills = [...profile.required, ...profile.preferred];
  let totalOccurrences = 0;
  let possibleTerms = 0;

  for (const skill of allSkills) {
    const aliases = getAliases(skill);
    possibleTerms += aliases.length;
    for (const alias of aliases) {
      // Count how many times this alias appears in the resume
      const matches = resumeLower.split(alias).length - 1;
      totalOccurrences += matches;
    }
  }

  // Cap at 2 occurrences per alias slot (more than 2 is keyword stuffing)
  const cappedMax = possibleTerms * 2;
  const cappedOccurrences = Math.min(totalOccurrences, cappedMax);
  return Math.round((cappedOccurrences / Math.max(cappedMax, 1)) * 100);
}

/**
 * Readability score: penalises overly long bullets and rewards concise,
 * action-verb-led lines. This is a heuristic — real readability is contextual.
 */
function computeReadabilityScore(resumeText: string): number {
  const lines = resumeText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*"));

  if (lines.length === 0) return 40; // no bullets at all is a problem

  let score = 0;
  const ACTION_VERB_RE =
    /^[•\-*]\s*(built|developed|implemented|designed|created|optimized|improved|automated|deployed|engineered|architected|integrated|led|managed|reduced|increased|scaled|launched|delivered|maintained|migrated|refactored|mentored|analysed|analyzed)/i;

  for (const line of lines) {
    const wordCount = line.split(/\s+/).length;
    // Ideal bullet: 10–25 words, starts with action verb
    if (wordCount >= 8 && wordCount <= 30) score += 2;
    if (ACTION_VERB_RE.test(line)) score += 3;
    if (wordCount > 40) score -= 2; // too verbose
  }

  const raw = Math.round((score / (lines.length * 5)) * 100);
  return Math.min(Math.max(raw, 0), 100);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface RoleAnalysis {
  roleMatchScore: number;
  keywordDensityScore: number;
  readabilityScore: number;
  matchedSkills: string[];
  missingSkills: string[];        // required skills only
  missingPreferred: string[];     // nice-to-have skills
  strengths: string[];
  suggestions: string[];
}

export function analyzeResume(resumeText: string, role: string): RoleAnalysis {
  const profile = ROLE_PROFILES[role.toLowerCase()];
  if (!profile) {
    // Unknown role — return a neutral result rather than crashing
    return {
      roleMatchScore: 0,
      keywordDensityScore: 0,
      readabilityScore: computeReadabilityScore(resumeText),
      matchedSkills: [],
      missingSkills: [],
      missingPreferred: [],
      strengths: [],
      suggestions: [`Role "${role}" is not in our database. Supported roles: ${Object.keys(ROLE_PROFILES).join(", ")}`],
    };
  }

  const resumeLower = resumeText.toLowerCase();

  const matchedRequired  = profile.required.filter((s) => resumeHasSkill(resumeLower, s));
  const missingRequired  = profile.required.filter((s) => !resumeHasSkill(resumeLower, s));
  const matchedPreferred = profile.preferred.filter((s) => resumeHasSkill(resumeLower, s));
  const missingPreferred = profile.preferred.filter((s) => !resumeHasSkill(resumeLower, s));

  // Weighted score: required skills matter more than preferred
  const requiredRatio  = matchedRequired.length  / Math.max(profile.required.length,  1);
  const preferredRatio = matchedPreferred.length / Math.max(profile.preferred.length, 1);
  const roleMatchScore = Math.round(requiredRatio * 70 + preferredRatio * 30);

  const keywordDensityScore = computeKeywordDensityScore(resumeLower, profile);
  const readabilityScore    = computeReadabilityScore(resumeText);

  // ── Strengths: summarise clusters, not one string per skill ───────────────
  const strengths: string[] = [];
  if (matchedRequired.length === profile.required.length) {
    strengths.push("Meets all required skills for this role");
  } else if (matchedRequired.length >= Math.ceil(profile.required.length * 0.75)) {
    strengths.push(`Covers ${matchedRequired.length} of ${profile.required.length} required skills`);
  }
  if (matchedPreferred.length >= 3) {
    strengths.push(`Strong preferred-skill coverage (${matchedPreferred.join(", ")})`);
  }
  if (keywordDensityScore >= 70) {
    strengths.push("High keyword alignment with typical job descriptions for this role");
  }

  // ── Suggestions ────────────────────────────────────────────────────────────
  const suggestions: string[] = [];
  if (missingRequired.length > 0) {
    suggestions.push(`Add missing required skills: ${missingRequired.join(", ")}`);
  }
  if (missingPreferred.length > 0 && missingPreferred.length <= 4) {
    suggestions.push(`Consider adding preferred skills: ${missingPreferred.join(", ")}`);
  }
  if (keywordDensityScore < 50) {
    suggestions.push(
      "Mirror the exact terminology from target job postings — ATS parsers rank by keyword frequency"
    );
  }

  return {
    roleMatchScore,
    keywordDensityScore,
    readabilityScore,
    matchedSkills:    [...matchedRequired, ...matchedPreferred],
    missingSkills:    missingRequired,
    missingPreferred,
    strengths,
    suggestions,
  };
}