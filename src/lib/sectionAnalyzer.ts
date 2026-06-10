/**
 * sectionAnalyzer.ts  (v2 — 8-section model)
 * Detects and scores each major resume section.
 *
 * New sections vs v1:
 *   + professionalSummary   (objective / summary / profile)
 *   + leadership            (leadership, activities, volunteering, community)
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
  professionalSummary: SectionResult;
  skills: SectionResult;
  experience: SectionResult;
  projects: SectionResult;
  education: SectionResult;
  certifications: SectionResult;
  achievements: SectionResult;
  leadership: SectionResult;
}

// ─── Section heading patterns (exact match after normalisation) ───────────────

const SECTION_PATTERNS: Record<string, string[]> = {
  professionalSummary: [
    "summary", "professional summary", "career summary", "profile",
    "professional profile", "about me", "objective", "career objective",
    "professional objective", "introduction", "overview", "bio",
    "about", "highlights", "career highlights",
  ],
  skills: [
    "skills", "technical skills", "technologies", "tech stack",
    "core competencies", "technical competencies", "tools & technologies",
    "tools and technologies", "programming languages", "languages & tools",
    "languages and tools", "key skills", "areas of expertise",
    "expertise", "competencies", "technical expertise",
  ],
  experience: [
    "experience", "work experience", "professional experience",
    "employment", "employment history", "work history",
    "internship", "internships", "industry experience",
    "career experience", "relevant experience",
  ],
  projects: [
    "projects", "personal projects", "academic projects", "key projects",
    "notable projects", "selected projects", "project experience",
    "side projects", "open source", "portfolio", "project work",
  ],
  education: [
    "education", "academic background", "academic qualifications",
    "qualifications", "educational background", "academic history",
    "academics", "educational qualifications",
  ],
  certifications: [
    "certifications", "certificates", "licenses", "credentials",
    "professional certifications", "courses", "online courses", "training",
    "moocs", "professional development", "continuing education",
  ],
  achievements: [
    "achievements", "awards", "accomplishments", "honors", "honours",
    "recognition", "competitive programming", "publications", "patents",
    "awards & honours", "awards and honors", "accolades",
  ],
  leadership: [
    "leadership", "activities", "extracurricular", "extracurricular activities",
    "volunteering", "volunteer work", "community service", "community",
    "clubs", "organizations", "societies", "involvement",
    "campus involvement", "student activities", "leadership & activities",
    "leadership and activities", "positions of responsibility",
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

// ─── Shared metric regex ──────────────────────────────────────────────────────

const METRIC_RE =
  /(\d+\.?\d*\s*%|\d[\d,]*\+|\$[\d,]+[km]?|\d+[km]\+?|\d+\s*(users|customers|clients|projects|downloads|stars|requests|records|issues|members|students|participants|teams|countries))/gi;

// ─── Section scorers ──────────────────────────────────────────────────────────

function scoreProfessionalSummary(content: string): SectionResult {
  if (!content.trim()) {
    return {
      found: false, score: 0, content: "",
      issues: ["No professional summary/objective found — add a 2–4 line summary at the top"],
    };
  }
  const issues: string[] = [];
  let score = 30;

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // Ideal summary: 40–80 words
  if (wordCount >= 40 && wordCount <= 120) score += 25;
  else if (wordCount >= 20) score += 12;
  else issues.push("Summary is too short — aim for 40–80 words");

  if (wordCount > 150) { score -= 10; issues.push("Summary is too long — keep it under 120 words"); }

  // Contains role/title mention
  const hasRole = /(engineer|developer|analyst|designer|manager|scientist|consultant|specialist|architect|intern)/i.test(content);
  if (hasRole) score += 15;
  else issues.push("Mention your role/title in the summary (e.g. 'Full Stack Developer with 3+ years...')");

  // Contains years-of-experience signal
  const hasYoe = /\d+\+?\s*years?/i.test(content);
  if (hasYoe) score += 10;

  // Contains at least one hard skill
  const hasSkill = /(python|javascript|react|java|sql|machine learning|cloud|aws|node|typescript|golang|c\+\+)/i.test(content);
  if (hasSkill) score += 10;
  else issues.push("Include 1–2 key technical skills in the summary");

  // Penalise generic fluff phrases
  const fluff = /(passionate about|hard[\s-]?working|team\s*player|fast learner|detail[\s-]?oriented|highly motivated)/gi;
  const fluffCount = (content.match(fluff) ?? []).length;
  if (fluffCount >= 2) { score -= 10; issues.push("Avoid generic buzzwords (e.g. 'passionate', 'hard-working') — be specific"); }

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreSkillsSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["Skills section not found"] };
  }
  const issues: string[] = [];
  let score = 30;

  const allSkills = content
    .split(/[\n,|•]/)
    .map((s) => s.replace(/.*?:/g, "").trim())
    .filter((s) => s.length > 1 && s.length < 50);

  const uniqueSkills = new Set(allSkills.map((s) => s.toLowerCase())).size;

  if (uniqueSkills >= 8)  score += 20;
  else if (uniqueSkills >= 4) score += 10;
  else issues.push("Skills section has very few skills listed");

  const categoryCount = (content.match(/\b(languages|frameworks|tools|databases|cloud|libraries|platforms|technologies|frontend|backend|devops)\s*:/gi) ?? []).length;
  if (categoryCount >= 2) score += 20;
  else if (categoryCount >= 1) score += 10;
  else issues.push("Group skills by category (e.g. Languages:, Frameworks:, Tools:)");

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount > 300) { score -= 10; issues.push("Skills section appears to contain prose — keep it as a concise list"); }

  score += Math.min(uniqueSkills, 10);

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
  else issues.push("No quantified achievements found — add metrics (e.g. 'reduced load time by 40%')");

  const hasDateRanges = /\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|present|current)/i.test(content);
  if (hasDateRanges) score += 10;
  else issues.push("Add date ranges to experience entries (e.g. Jun 2023 – Present)");

  // Strong action verbs: STAR-method signals
  const actionVerbs = /(built|developed|designed|led|architected|engineered|optimized|reduced|improved|increased|launched|deployed|automated|streamlined|collaborated|mentored|managed|delivered|created|implemented)/gi;
  const verbCount = (content.match(actionVerbs) ?? []).length;
  if (verbCount >= 4) score += 10;
  else if (verbCount < 2) issues.push("Start bullet points with strong action verbs (Built, Designed, Optimized, Led)");

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 100) score += 10;
  else if (wordCount < 30) issues.push("Experience section is very thin — expand on responsibilities and impact");

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

  const hasLinks = /(github\.com|vercel\.app|netlify\.app|render\.com|live demo|deployed|demo link)/i.test(content);
  if (hasLinks) score += 20;
  else issues.push("Include GitHub links or live demo URLs for your projects");

  // Tech stack mentioned
  const hasTechStack = /(built with|tech stack|technologies|using|powered by)/i.test(content);
  if (hasTechStack) score += 10;

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
  let score = 40;

  const hasDegree = /(b\.?tech|b\.?e\.?|b\.?sc|m\.?tech|m\.?sc|bachelor|master|phd|mba|diploma|associate|b\.?a\.?|m\.?a\.?)/i.test(content);
  if (hasDegree) score += 25;
  else issues.push("Degree type not clearly stated (e.g. B.Tech, B.Sc, MBA)");

  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(content);
  if (hasYear) score += 15;
  else issues.push("Add graduation year to education entry");

  const hasGPA = /(cgpa|gpa|percentage|grade|9\.\d|8\.\d|\d{2}%)/i.test(content);
  if (hasGPA) score += 10;

  const hasInstitution = content.split(/\s+/).filter(Boolean).length >= 5;
  if (!hasInstitution) issues.push("Institution name appears missing from education section");

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreCertificationsSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["Certifications section not found — add industry certs to boost ATS score"] };
  }
  const issues: string[] = [];
  let score = 40;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 30) score += 20;
  else if (wordCount >= 10) score += 10;
  else issues.push("Certifications section is very short");

  // Recognised cert authorities
  const knownCerts = /(aws|google|microsoft|azure|gcp|oracle|cisco|comptia|pmp|scrum|agile|salesforce|meta|coursera|udemy|edx|linkedin learning)/i.test(content);
  if (knownCerts) score += 20;

  const bulletCount = (content.match(/^[•\-*▸►]/gm) ?? []).length;
  if (bulletCount >= 2) score += 10;

  // Has year (issued/expiry)
  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(content);
  if (hasYear) score += 10;
  else issues.push("Add the year each certification was obtained");

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreAchievementsSection(content: string): SectionResult {
  if (!content.trim()) {
    return { found: false, score: 0, content: "", issues: ["Achievements section not found"] };
  }
  const issues: string[] = [];
  let score = 40;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 30) score += 15;
  else if (wordCount >= 10) score += 8;
  else issues.push("Achievements section is very short");

  const bulletCount = (content.match(/^[•\-*▸►]/gm) ?? []).length;
  if (bulletCount >= 2) score += 15;

  const metricCount = (content.match(METRIC_RE) ?? []).length;
  if (metricCount >= 2) score += 20;
  else if (metricCount >= 1) score += 10;
  else issues.push("Quantify your achievements (e.g. 'Ranked top 5% in national hackathon')");

  // Tier-1 achievement signals
  const tier1 = /(winner|hackathon|ranked|top \d|award|scholarship|fellowship|national|international|first place)/i.test(content);
  if (tier1) score += 10;

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreLeadershipSection(content: string): SectionResult {
  if (!content.trim()) {
    return {
      found: false, score: 0, content: "",
      issues: ["Leadership & Activities section not found — add clubs, volunteering, or leadership roles"],
    };
  }
  const issues: string[] = [];
  let score = 40;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 40) score += 20;
  else if (wordCount >= 15) score += 10;
  else issues.push("Add more detail to leadership/activities entries");

  const bulletCount = (content.match(/^[•\-*▸►]/gm) ?? []).length;
  if (bulletCount >= 2) score += 15;

  // Leadership role keywords
  const leadershipKw = /(president|vice president|secretary|treasurer|captain|lead|head|coordinator|organizer|chair|founder|co-founder|officer|director|mentor|tutor)/i.test(content);
  if (leadershipKw) score += 15;
  else issues.push("Highlight formal leadership titles (President, Lead, Coordinator, etc.)");

  const metricCount = (content.match(METRIC_RE) ?? []).length;
  if (metricCount >= 1) score += 10;

  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(content);
  if (hasYear) score += 5;
  else issues.push("Add dates to your leadership/activity entries");

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
    certifications: scoreCertificationsSection(
      extractSection(resumeText, SECTION_PATTERNS.certifications)
    ),
    achievements: scoreAchievementsSection(
      extractSection(resumeText, SECTION_PATTERNS.achievements)
    ),
    leadership: scoreLeadershipSection(
      extractSection(resumeText, SECTION_PATTERNS.leadership)
    ),
  };
}