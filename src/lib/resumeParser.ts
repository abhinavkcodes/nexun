/**
 * sectionAnalyzer.ts
 * Detects and scores each major resume section.
 *
 * Scoring philosophy:
 *  - A section that merely exists starts at 30 (present but empty = not good)
 *  - Points are earned by content quality signals (bullets, metrics, keywords)
 *  - Maximum is 100; no section gets a free score just for being present
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
}

// ─── Section heading patterns (exact match after normalisation) ───────────────

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
    "leadership", "activities", "publications", "patents",
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
    // Skip lines that are too long to be headings
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

// ─── Section scorers (each is specialised per section type) ──────────────────

const METRIC_RE =
  /(\d+\.?\d*\s*%|\d[\d,]*\+|\$[\d,]+[km]?|\d+[km]\+?|\d+\s*(users|customers|clients|projects|downloads|stars|requests|records|issues))/gi;

function scoreSkillsSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["Skills section not found"] };
  }
  const issues: string[] = [];
  let score = 30; // base: present

  const allSkills = content
    .split(/[\n,|•]/)
    .map((s) => s.replace(/.*?:/g, "").trim()) // strip "Languages: ..."
    .filter((s) => s.length > 1 && s.length < 50);

  const uniqueSkills = new Set(allSkills.map((s) => s.toLowerCase())).size;

  if (uniqueSkills >= 8)  score += 20;
  else if (uniqueSkills >= 4) score += 10;
  else issues.push("Skills section has very few skills listed");

  // Reward categorisation (Languages:, Frameworks:, Tools:, etc.)
  const categoryCount = (content.match(/\b(languages|frameworks|tools|databases|cloud|libraries|platforms)\s*:/gi) ?? []).length;
  if (categoryCount >= 2) score += 20;
  else if (categoryCount >= 1) score += 10;
  else issues.push("Consider grouping skills by category (Languages, Frameworks, Tools)");

  // Penalise skill sections with very long prose (copy-pasted descriptions)
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount > 300) { score -= 10; issues.push("Skills section appears to contain prose — keep it as a concise list"); }

  score += Math.min(uniqueSkills, 10); // small bonus for breadth

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreExperienceSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["Experience section not found"] };
  }
  const issues: string[] = [];
  let score = 30;

  const bulletCount = (content.match(/^[•\-*▸►]/gm) ?? []).length;
  if (bulletCount >= 6)  score += 20;
  else if (bulletCount >= 3) score += 10;
  else issues.push("Add more bullet-point descriptions to experience entries");

  const metricCount = (content.match(METRIC_RE) ?? []).length;
  if (metricCount >= 4)  score += 20;
  else if (metricCount >= 1) score += 10;
  else issues.push("No quantified achievements found in experience");

  const hasDateRanges = /\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|present|current)/i.test(content);
  if (hasDateRanges) score += 10;
  else issues.push("Add date ranges to experience entries (e.g. Jun 2023 – Present)");

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 100) score += 10;
  else if (wordCount < 30) issues.push("Experience section is very thin — expand on your responsibilities and impact");

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreProjectsSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["Projects section not found"] };
  }
  const issues: string[] = [];
  let score = 30;

  const bulletCount = (content.match(/^[•\-*▸►]/gm) ?? []).length;
  if (bulletCount >= 4) score += 15;
  else if (bulletCount >= 2) score += 8;

  const metricCount = (content.match(METRIC_RE) ?? []).length;
  if (metricCount >= 2) score += 20;
  else if (metricCount === 1) score += 10;
  else issues.push("Add measurable outcomes to projects (users, performance improvements, etc.)");

  const hasLinks = /(github\.com|vercel\.app|netlify\.app|render\.com|live demo|deployed)/i.test(content);
  if (hasLinks) score += 20;
  else issues.push("Include GitHub links or live demo URLs for your projects");

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 80) score += 15;
  else if (wordCount < 30) issues.push("Projects section is too brief — describe the tech stack and your contribution");

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreEducationSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["Education section not found"] };
  }
  const issues: string[] = [];
  let score = 40; // education is typically short, so base is higher

  const hasDegree = /(b\.?tech|b\.?e\.?|b\.?sc|m\.?tech|m\.?sc|bachelor|master|phd|mba|diploma)/i.test(content);
  if (hasDegree) score += 25;
  else issues.push("Degree type not clearly stated");

  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(content);
  if (hasYear) score += 15;
  else issues.push("Add graduation year to education entry");

  const hasGPA = /(cgpa|gpa|percentage|grade|9\.\d|8\.\d|\d{2}%)/i.test(content);
  if (hasGPA) score += 10; // bonus, not required

  const hasInstitution = content.split(/\s+/).filter(Boolean).length >= 5;
  if (!hasInstitution) issues.push("Institution name appears missing from education section");

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreGenericSection(content: string, sectionName: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: [`${sectionName} section not found`] };
  }
  const issues: string[] = [];
  let score = 40;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 30) score += 20;
  else if (wordCount >= 10) score += 10;
  else issues.push(`${sectionName} section is very short`);

  const bulletCount = (content.match(/^[•\-*▸►]/gm) ?? []).length;
  if (bulletCount >= 2) score += 20;

  const metricCount = (content.match(METRIC_RE) ?? []).length;
  if (metricCount >= 1) score += 20;

  return { found: true, score: Math.min(score, 100), content, issues };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function analyzeSections(resumeText: string): SectionAnalysis {
  return {
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
  };
}