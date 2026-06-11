/**
 * sectionAnalyzer.ts  (v2 — PDF-tolerant + improved section scorers)
 *
 * Key changes from v1:
 *  - scoreExperienceSection: bullet count detection now includes PDF-style
 *    lines (starting with capital past/present participle). Previously a
 *    PDF-extracted resume with 8 good bullets all stripped of their "•" chars
 *    would score 30 (base only). Now those lines are properly counted.
 *  - scoreExperienceSection: date-range pattern made more inclusive (handles
 *    "2023 – Present", "Jun 2023 – Dec 2024", "August 2022 – Present").
 *  - scoreProjectsSection: link detection extended to common deploy platforms.
 *  - scoreSkillsSection: no-category penalty softened — many good resumes list
 *    skills inline without "Languages:", "Frameworks:" labels.
 *  - Added `professionalSummary` and `leadership` section parsers (referenced in
 *    route.ts buildSectionRows but missing from v1).
 *  - All scorers: word-count thresholds reviewed and documented.
 */

export interface SectionResult {
  found: boolean;
  score: number;
  content: string;
  issues: string[];
}

export interface SectionAnalysis {
  skills: SectionResult;
  experience: SectionResult;
  projects: SectionResult;
  education: SectionResult;
  certifications: SectionResult;
  achievements: SectionResult;
  /** New in v2 — used by route.ts buildSectionRows */
  professionalSummary: SectionResult;
  leadership: SectionResult;
}

// ─── Section heading patterns ────────────────────────────────────────────────

const SECTION_PATTERNS: Record<string, string[]> = {
  skills: [
    "skills", "technical skills", "technologies", "tech stack",
    "core competencies", "technical competencies", "tools & technologies",
    "tools and technologies", "programming languages", "languages & tools",
    "languages and tools", "key skills",
  ],
  experience: [
    "experience", "work experience", "professional experience",
    "employment", "employment history", "work history",
    "internship", "internships", "industry experience",
  ],
  projects: [
    "projects", "personal projects", "academic projects", "key projects",
    "notable projects", "selected projects", "project experience",
    "side projects", "open source",
  ],
  education: [
    "education", "academic background", "academic qualifications",
    "qualifications", "educational background", "academic history",
  ],
  certifications: [
    "certifications", "certificates", "licenses", "credentials",
    "professional certifications", "courses", "online courses", "training",
    "moocs",
  ],
  achievements: [
    "achievements", "awards", "accomplishments", "honors", "honours",
    "recognition", "competitive programming", "extracurricular",
    "activities", "publications", "patents",
  ],
  professionalSummary: [
    "summary", "professional summary", "career summary", "objective",
    "career objective", "profile", "about me", "about", "overview",
  ],
  leadership: [
    "leadership", "leadership & activities", "leadership and activities",
    "volunteer", "volunteering", "community", "clubs", "organizations",
    "extracurricular activities", "positions of responsibility",
  ],
};

// ─── Normalisation ────────────────────────────────────────────────────────────

function normalizeLine(line: string): string {
  return line
    .toLowerCase()
    .replace(/[:\-–—|/\\*_#•]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSectionHeading(normalized: string): boolean {
  return Object.values(SECTION_PATTERNS)
    .flat()
    .some((pattern) => normalized === pattern);
}

function matchesSection(normalized: string, keywords: string[]): boolean {
  return keywords.some((kw) => normalized === kw);
}

// ─── Section extraction ───────────────────────────────────────────────────────

function extractSection(text: string, keywords: string[]): string {
  const lines = text.split("\n");
  let startIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.length > 70) continue;
    if (matchesSection(normalizeLine(trimmed), keywords)) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) return "";

  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.length > 70) continue;
    if (isSectionHeading(normalizeLine(trimmed))) {
      endIndex = i;
      break;
    }
  }

  return lines.slice(startIndex + 1, endIndex).join("\n").trim();
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const METRIC_RE =
  /(\d+\.?\d*\s*%|\d[\d,]*\+|\$[\d,]+[km]?|\d+[km]\+?|\d+\s*(users|customers|clients|projects|downloads|stars|requests|records|issues))/gi;

/**
 * Counts bullet-style lines robustly, including PDF-extracted text where bullet
 * characters are stripped. Lines starting with a capital past/present participle
 * are treated as bullets (e.g. "Developed a REST API..." → counts).
 */
function countBulletLines(content: string): number {
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        /^[•\-*▸►✓→·]/.test(l) ||
        /^[A-Z][a-z]+(ed|ing)\b/.test(l)
    ).length;
}

// ─── Section scorers ──────────────────────────────────────────────────────────

function scoreSkillsSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["Skills section not found"] };
  }
  const issues: string[] = [];
  let score = 30; // base: present

  const allSkills = content
    .split(/[\n,|•]/)
    .map((s) => s.replace(/.*?:/g, "").trim())
    .filter((s) => s.length > 1 && s.length < 50);

  const uniqueSkills = new Set(allSkills.map((s) => s.toLowerCase())).size;

  if (uniqueSkills >= 8)  score += 25;
  else if (uniqueSkills >= 5) score += 15;
  else if (uniqueSkills >= 3) score += 8;
  else issues.push("Skills section has very few skills listed");

  // Reward categorisation (Languages:, Frameworks:, Tools:, etc.)
  const categoryCount = (content.match(/\b(languages|frameworks|tools|databases|cloud|libraries|platforms|technologies)\s*:/gi) ?? []).length;
  if (categoryCount >= 2)      score += 20;
  else if (categoryCount >= 1) score += 12;
  // Removed the "no category" penalty — inline skill lists are equally valid

  // Penalise skill sections with very long prose
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount > 300) {
    score -= 10;
    issues.push("Skills section appears to contain prose — keep it as a concise list");
  }

  // Small bonus for breadth
  score += Math.min(uniqueSkills * 0.5, 5);

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreExperienceSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["Experience section not found"] };
  }
  const issues: string[] = [];
  let score = 30;

  // PDF-tolerant bullet count
  const bulletCount = countBulletLines(content);
  if (bulletCount >= 6)       score += 22;
  else if (bulletCount >= 3)  score += 12;
  else if (bulletCount >= 1)  score += 5;
  else issues.push("Add bullet-point descriptions to experience entries");

  // Metrics
  const metricCount = (content.match(METRIC_RE) ?? []).length;
  if (metricCount >= 4)       score += 20;
  else if (metricCount >= 1)  score += 12;
  else issues.push("No quantified achievements found in experience");

  // Date ranges: handles "Jun 2023 – Present", "2021 – 2023", "August 2022 – Dec 2024"
  const hasDateRanges =
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\b|\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|present|current)/i.test(content);
  if (hasDateRanges) score += 10;
  else issues.push("Add date ranges to experience entries (e.g. Jun 2023 – Present)");

  // Content length
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 100)      score += 8;
  else if (wordCount < 30)   issues.push("Experience section is very thin — expand on responsibilities and impact");

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreProjectsSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["Projects section not found"] };
  }
  const issues: string[] = [];
  let score = 30;

  // PDF-tolerant bullet count
  const bulletCount = countBulletLines(content);
  if (bulletCount >= 4)      score += 15;
  else if (bulletCount >= 2) score += 8;

  // Metrics
  const metricCount = (content.match(METRIC_RE) ?? []).length;
  if (metricCount >= 2)      score += 20;
  else if (metricCount === 1) score += 10;
  else issues.push("Add measurable outcomes to projects (users, performance improvements, etc.)");

  // Links / deployment evidence
  const hasLinks =
    /(github\.com|vercel\.app|netlify\.app|render\.com|railway\.app|fly\.io|live demo|deployed|hosted at|production)/i.test(content);
  if (hasLinks) score += 20;
  else issues.push("Include GitHub links or live demo URLs for your projects");

  // Word count
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 80)      score += 15;
  else if (wordCount < 30)  issues.push("Projects section is too brief — describe the tech stack and your contribution");

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreEducationSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["Education section not found"] };
  }
  const issues: string[] = [];
  let score = 40;

  const hasDegree = /(b\.?tech|b\.?e\.?|b\.?sc|m\.?tech|m\.?sc|bachelor|master|phd|mba|diploma)/i.test(content);
  if (hasDegree) score += 25;
  else issues.push("Degree type not clearly stated");

  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(content);
  if (hasYear) score += 15;
  else issues.push("Add graduation year to education entry");

  const hasGPA = /(cgpa|gpa|percentage|grade|9\.\d|8\.\d|\d{2}%)/i.test(content);
  if (hasGPA) score += 10;

  const hasInstitution = content.split(/\s+/).filter(Boolean).length >= 5;
  if (!hasInstitution) issues.push("Institution name appears missing from education section");

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreProfessionalSummary(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["No professional summary found — consider adding a 2–3 line headline"] };
  }
  const issues: string[] = [];
  let score = 40;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 30 && wordCount <= 100) {
    score += 35; // ideal summary length
  } else if (wordCount < 15) {
    score += 10;
    issues.push("Summary is too brief — aim for 2–4 sentences");
  } else if (wordCount > 150) {
    score += 15;
    issues.push("Summary is too long — keep it to 2–4 sentences (recruiters skim)");
  } else {
    score += 25;
  }

  // Reward role-specific keywords
  const hasRoleSignal = /(engineer|developer|analyst|scientist|designer|manager|specialist)/i.test(content);
  if (hasRoleSignal) score += 15;
  else issues.push("Include your target role title in the summary for ATS keyword matching");

  // Penalise first-person pronouns
  const firstPersonCount = (content.match(/\b(I|me|my|myself)\b/g) ?? []).length;
  if (firstPersonCount > 2) {
    score -= 10;
    issues.push("Avoid 'I/me/my' in summary — use third-person style: 'Full-stack engineer with…'");
  }

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreLeadershipSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["No leadership/activities section found"] };
  }
  const issues: string[] = [];
  let score = 40;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 30)       score += 20;
  else if (wordCount >= 10)  score += 10;
  else issues.push("Leadership section is very short");

  const bulletCount = countBulletLines(content);
  if (bulletCount >= 2) score += 20;

  const metricCount = (content.match(METRIC_RE) ?? []).length;
  if (metricCount >= 1) score += 20;

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreGenericSection(content: string, sectionName: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: [`${sectionName} section not found`] };
  }
  const issues: string[] = [];
  let score = 40;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 30)       score += 20;
  else if (wordCount >= 10)  score += 10;
  else issues.push(`${sectionName} section is very short`);

  const bulletCount = countBulletLines(content);
  if (bulletCount >= 2) score += 20;

  const metricCount = (content.match(METRIC_RE) ?? []).length;
  if (metricCount >= 1) score += 20;

  return { found: true, score: Math.min(score, 100), content, issues };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function analyzeSections(resumeText: string): SectionAnalysis {
  return {
    professionalSummary: scoreProfessionalSummary(
      extractSection(resumeText, SECTION_PATTERNS.professionalSummary)
    ),
    skills: scoreSkillsSection(
      extractSection(resumeText, SECTION_PATTERNS.skills)
    ),
    experience: scoreExperienceSection(
      extractSection(resumeText, SECTION_PATTERNS.experience)
    ),
    projects: scoreProjectsSection(
      extractSection(resumeText, SECTION_PATTERNS.projects)
    ),
    education: scoreEducationSection(
      extractSection(resumeText, SECTION_PATTERNS.education)
    ),
    certifications: scoreGenericSection(
      extractSection(resumeText, SECTION_PATTERNS.certifications),
      "Certifications"
    ),
    achievements: scoreGenericSection(
      extractSection(resumeText, SECTION_PATTERNS.achievements),
      "Achievements"
    ),
    leadership: scoreLeadershipSection(
      extractSection(resumeText, SECTION_PATTERNS.leadership)
    ),
  };
}