/**
 * analyzer.ts  (v2 — improved scoring)
 *
 * Changes from v1:
 *  - keywordDensityScore now measures coverage breadth (unique matched aliases / total
 *    role aliases) rather than raw occurrence count. This aligns with how Jobscan,
 *    Resume Worded, and Lever actually score keyword coverage: they care whether each
 *    relevant term appears at least once, not how many times it's repeated.
 *  - roleMatchScore formula unchanged (required 70% / preferred 30% split is correct).
 *  - readabilityScore: added fallback for PDF-extracted resumes where bullets are
 *    stripped — lines starting with a capital past-participle are counted as bullets.
 *  - Added "roleDetected" flag so callers can degrade gracefully for unknown roles.
 */

// ─── Skill alias map ──────────────────────────────────────────────────────────
const SKILL_ALIASES: Record<string, string[]> = {
  javascript:           ["javascript", "js", "es6", "es2015", "ecmascript"],
  typescript:           ["typescript", "ts"],
  react:                ["react", "react.js", "reactjs"],
  "next.js":            ["next.js", "nextjs", "next js"],
  "node.js":            ["node.js", "nodejs", "node js"],
  express:              ["express", "express.js", "expressjs"],
  vue:                  ["vue", "vue.js", "vuejs"],
  angular:              ["angular", "angularjs"],
  css:                  ["css", "css3", "scss", "sass", "less", "styled-components"],
  tailwind:             ["tailwind", "tailwindcss", "tailwind css"],
  html:                 ["html", "html5"],
  postgresql:           ["postgresql", "postgres", "pg", "psql"],
  mongodb:              ["mongodb", "mongo"],
  mysql:                ["mysql", "mariadb"],
  redis:                ["redis"],
  sqlite:               ["sqlite"],
  python:               ["python", "python3"],
  pandas:               ["pandas", "pd"],
  numpy:                ["numpy", "np"],
  fastapi:              ["fastapi", "fast api"],
  flask:                ["flask"],
  django:               ["django"],
  tensorflow:           ["tensorflow", "tf", "keras"],
  pytorch:              ["pytorch", "torch"],
  "machine learning":   ["machine learning", "ml", "sklearn", "scikit-learn", "scikit learn"],
  langchain:            ["langchain", "lang chain"],
  llm:                  ["llm", "large language model", "large language models"],
  rag:                  ["rag", "retrieval augmented generation", "retrieval-augmented"],
  "vector database":    ["vector database", "vector db", "pinecone", "weaviate", "qdrant", "chroma"],
  "computer vision":    ["computer vision", "cv", "opencv", "image processing"],
  aws:                  ["aws", "amazon web services", "amazon aws", "ec2", "s3", "lambda"],
  gcp:                  ["gcp", "google cloud", "google cloud platform"],
  azure:                ["azure", "microsoft azure"],
  docker:               ["docker", "containerization", "containers"],
  kubernetes:           ["kubernetes", "k8s"],
  "ci/cd":              ["ci/cd", "cicd", "github actions", "jenkins", "gitlab ci", "circleci"],
  linux:                ["linux", "unix", "bash", "shell scripting"],
  git:                  ["git", "github", "gitlab", "bitbucket", "version control"],
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
  excel:                ["excel", "microsoft excel", "spreadsheet"],
  tableau:              ["tableau"],
  "power bi":           ["power bi", "powerbi"],
};

// ─── Role profiles ────────────────────────────────────────────────────────────
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
 * Keyword density score v2 — coverage breadth model.
 *
 * Modern ATS (Jobscan, Greenhouse, Lever) rank resumes by whether each relevant
 * keyword APPEARS, not by how many times it's repeated. Repetition beyond 2–3
 * occurrences does not boost ranking and can trigger spam filters.
 *
 * Score = (unique role-alias terms present in resume) / (total unique role-alias terms)
 * Weighted: required-skill aliases count 2×, preferred count 1× (mirrors ATS ranking).
 */
function computeKeywordDensityScore(
  resumeLower: string,
  profile: RoleProfile
): number {
  let covered = 0;
  let total   = 0;

  for (const skill of profile.required) {
    const aliases = getAliases(skill);
    total += 2; // 2 points per required skill regardless of alias count
    for (const alias of aliases) {
      if (resumeLower.includes(alias)) {
        covered += 2;
        break;
      }
    }
  }

  for (const skill of profile.preferred) {
    const aliases = getAliases(skill);
    total += 1; // 1 point per preferred skill regardless of alias count
    for (const alias of aliases) {
      if (resumeLower.includes(alias)) {
        covered += 1;
        break;
      }
    }
  }

  if (total === 0) return 0;
  return Math.round((covered / total) * 100);
}

/**
 * Readability score v2 — PDF-tolerant.
 *
 * Many PDF extractors strip bullet characters. We additionally count lines that
 * start with a capital past-participle (e.g. "Built", "Developed", "Reduced")
 * as bullet lines, since these are the most reliable signal of bullet-style
 * writing even when formatting is lost.
 */
function computeReadabilityScore(resumeText: string): number {
  const lines = resumeText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Count bullet-style lines: explicit chars OR action-verb-started lines
  const bulletLines = lines.filter(
    (l) =>
      /^[•\-*▸►✓→·]/.test(l) ||
      /^[A-Z][a-z]+(ed|ing)\b/.test(l)
  );

  if (bulletLines.length === 0) return 35; // no bullet-style writing at all

  const ACTION_VERB_RE =
    /^[•\-*]?\s*(built|developed|implemented|designed|created|optimized|improved|automated|deployed|engineered|architected|integrated|led|managed|reduced|increased|scaled|launched|delivered|maintained|migrated|refactored|mentored|analysed|analyzed|spearheaded|generated|streamlined|resolved|coordinated|conducted|researched|established|produced)/i;

  let score = 0;
  for (const line of bulletLines) {
    const wordCount = line.split(/\s+/).length;
    if (wordCount >= 8 && wordCount <= 30) score += 2;
    if (ACTION_VERB_RE.test(line)) score += 3;
    if (wordCount > 40) score -= 1;
  }

  const raw = Math.round((score / (bulletLines.length * 5)) * 100);
  return Math.min(Math.max(raw, 0), 100);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface RoleAnalysis {
  roleMatchScore: number;
  keywordDensityScore: number;
  readabilityScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  missingPreferred: string[];
  strengths: string[];
  suggestions: string[];
  /** true if the role was found in our profile DB, false for unknown roles */
  roleDetected: boolean;
}

export function analyzeResume(resumeText: string, role: string): RoleAnalysis {
  const profile = ROLE_PROFILES[role.toLowerCase()];
  if (!profile) {
    return {
      roleMatchScore: 50,        // neutral — don't tank score for unknown role
      keywordDensityScore: 50,
      readabilityScore: computeReadabilityScore(resumeText),
      matchedSkills: [],
      missingSkills: [],
      missingPreferred: [],
      strengths: [],
      suggestions: [`Role "${role}" is not in our database. Supported roles: ${Object.keys(ROLE_PROFILES).join(", ")}`],
      roleDetected: false,
    };
  }

  const resumeLower = resumeText.toLowerCase();

  const matchedRequired  = profile.required.filter((s) => resumeHasSkill(resumeLower, s));
  const missingRequired  = profile.required.filter((s) => !resumeHasSkill(resumeLower, s));
  const matchedPreferred = profile.preferred.filter((s) => resumeHasSkill(resumeLower, s));
  const missingPreferred = profile.preferred.filter((s) => !resumeHasSkill(resumeLower, s));

  // Weighted score: required skills 70%, preferred 30%
  const requiredRatio  = matchedRequired.length  / Math.max(profile.required.length,  1);
  const preferredRatio = matchedPreferred.length / Math.max(profile.preferred.length, 1);
  const roleMatchScore = Math.round(requiredRatio * 70 + preferredRatio * 30);

  const keywordDensityScore = computeKeywordDensityScore(resumeLower, profile);
  const readabilityScore    = computeReadabilityScore(resumeText);

  // ── Strengths ──────────────────────────────────────────────────────────────
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
    strengths.push("High keyword coverage for this role");
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
      "Mirror the exact terminology from target job postings — ATS parsers check keyword presence"
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
    roleDetected: true,
  };
}