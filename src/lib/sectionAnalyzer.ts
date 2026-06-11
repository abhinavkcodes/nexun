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
      issues: [
        "No professional summary found — add a 3–5 sentence paragraph at the top of your resume.",
        "A strong summary should state: your role/title → years of experience → 2–3 top skills → one measurable achievement or career goal.",
        "Example: 'Full Stack Developer with 3+ years building scalable React/Node.js applications. Delivered a platform serving 50k+ users and reduced API response time by 35%. Seeking a senior engineering role focused on distributed systems.'",
      ],
    };
  }

  const issues: string[] = [];
  let score = 10; // base: section exists but quality must be earned

  const words = content.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // ── CHECK 1: Length (15 pts) ─────────────────────────────────────────────────
  // Ideal ATS-friendly summary: 40–100 words (3–5 sentences)
  if (wordCount >= 40 && wordCount <= 100) {
    score += 15;
  } else if (wordCount >= 25 && wordCount < 40) {
    score += 8;
    issues.push(
      `Summary is short (${wordCount} words) — expand to 40–100 words. ` +
      "Add context about your experience level, core skills, and one concrete achievement or goal."
    );
  } else if (wordCount > 100 && wordCount <= 130) {
    score += 10;
    issues.push(
      `Summary is slightly long (${wordCount} words) — trim to under 100 words. ` +
      "Remove adjectives and filler phrases; every sentence should add a distinct fact."
    );
  } else if (wordCount > 130) {
    score += 5;
    issues.push(
      `Summary is too long (${wordCount} words) — recruiters spend ~7 seconds on a resume. ` +
      "Condense to 3–5 punchy sentences (40–100 words) focusing on your strongest selling points."
    );
  } else {
    // < 25 words
    issues.push(
      `Summary is very short (${wordCount} words) — this reads like a placeholder. ` +
      "Write 3–5 sentences: who you are, what you bring, and what you're looking for."
    );
  }

  // ── CHECK 2: Role / Title mention (15 pts) ───────────────────────────────────
  const ROLE_RE = /(software\s+engineer|frontend|back[\s-]?end|full[\s-]?stack|data\s+scientist|data\s+analyst|ml\s+engineer|devops|cloud\s+engineer|product\s+manager|ui\/ux|ux\s+designer|web\s+developer|mobile\s+developer|android|ios\s+developer|engineer|developer|analyst|designer|manager|scientist|consultant|specialist|architect|intern|researcher|programmer)/i;
  const hasRole = ROLE_RE.test(content);
  if (hasRole) {
    score += 15;
  } else {
    issues.push(
      "Your job title/role is not mentioned in the summary. " +
      "Start with a clear identity statement, e.g. 'Full Stack Developer', 'Data Analyst', or 'Backend Engineer'."
    );
  }

  // ── CHECK 3: Years of experience (10 pts) ────────────────────────────────────
  const hasYoe = /(\d+\+?\s*years?\s*(of)?\s*(experience|exp|background|expertise|practice))|(\bentry[\s-]level\b|\bfresher\b|\brecent\s+graduate\b)/i.test(content);
  if (hasYoe) {
    score += 10;
  } else {
    issues.push(
      "Experience level is not stated. Add a signal like '3+ years of experience', '2 years building ...', " +
      "or if you're entry-level, say 'recent Computer Science graduate' or 'entry-level developer'."
    );
  }

  // ── CHECK 4: Hard technical skills (15 pts) ──────────────────────────────────
  const TECH_RE = /(python|javascript|typescript|react|angular|vue|node\.?js|java|kotlin|swift|go|golang|rust|c\+\+|c#|\.net|ruby|rails|php|laravel|django|flask|fastapi|spring|express|sql|postgresql|mysql|mongodb|redis|docker|kubernetes|aws|gcp|azure|terraform|linux|git|graphql|rest\s+api|machine\s+learning|deep\s+learning|nlp|pytorch|tensorflow|scikit[\s-]learn|pandas|spark|hadoop|tableau|power\s*bi|excel)/i;
  const techMatches = content.match(new RegExp(TECH_RE.source, "gi")) ?? [];
  const uniqueTechSkills = new Set(techMatches.map(s => s.toLowerCase())).size;

  if (uniqueTechSkills >= 3) {
    score += 15;
  } else if (uniqueTechSkills >= 1) {
    score += 8;
    issues.push(
      `Only ${uniqueTechSkills} technical skill(s) detected in summary. ` +
      "Include 2–3 of your strongest skills so recruiters and ATS systems can immediately identify your stack."
    );
  } else {
    issues.push(
      "No recognisable technical skills found in summary. " +
      "Name your top 2–3 technologies/tools (e.g. 'React, Node.js, PostgreSQL') to pass ATS keyword filters."
    );
  }

  // ── CHECK 5: Quantified achievement or impact (15 pts) ───────────────────────
  const hasMetric = METRIC_RE.test(content);
  const hasImpactVerb = /(increased|reduced|improved|saved|delivered|built|launched|scaled|optimised|optimized|boosted|cut|grew|led|shipped|deployed)/i.test(content);

  if (hasMetric) {
    score += 15;
  } else if (hasImpactVerb) {
    score += 7;
    issues.push(
      "Good — you used an impact verb, but no numbers were found. " +
      "Add a metric to make it concrete: e.g. 'reduced load time by 40%', 'built a system serving 10k+ users', 'improved test coverage from 45% to 90%'."
    );
  } else {
    issues.push(
      "No quantified achievement found in summary. " +
      "Include at least one number or result to demonstrate impact: e.g. 'delivered 5 production features', 'reduced bug count by 30%', 'led a team of 4 engineers'."
    );
  }

  // ── CHECK 6: Value proposition / career goal clarity (10 pts) ────────────────
  const hasGoal = /(seeking|looking for|aspiring|passionate about building|focused on|specialising in|specializing in|with a focus on|aiming to|goal is|passionate about|interested in)/i.test(content);
  const hasDomain = /(fintech|edtech|healthtech|e[\s-]?commerce|saas|startup|enterprise|b2b|b2c|open[\s-]?source|distributed\s+systems|real[\s-]?time|embedded|systems\s+programming|backend\s+systems|data\s+engineering|platform|infrastructure|product)/i.test(content);

  if (hasGoal || hasDomain) {
    score += 10;
  } else {
    issues.push(
      "Summary doesn't communicate what kind of role or domain you're targeting. " +
      "Add a closing line like 'seeking a backend engineering role at a growth-stage startup' or 'focused on data engineering and real-time analytics'."
    );
  }

  // ── CHECK 7: First-person 'I' usage (penalty –8) ─────────────────────────────
  // Resumes should be written in the implied first person — starting bullets/sentences
  // with verbs, never with "I". This is a universal resume convention.
  const firstPersonCount = (content.match(/\bI\b/g) ?? []).length;
  if (firstPersonCount >= 2) {
    score -= 8;
    issues.push(
      `Found ${firstPersonCount} uses of 'I' in the summary — remove all of them. ` +
      "Resume summaries use the implied first person: start sentences with your role or strong verbs, not 'I'. " +
      "Bad: 'I am a developer who built...' → Good: 'Full Stack Developer who built...'"
    );
  } else if (firstPersonCount === 1) {
    score -= 3;
    issues.push(
      "Avoid using 'I' in your resume summary — it's a common mistake. " +
      "Replace with your title or a verb: 'I designed...' → 'Designed...'"
    );
  }

  // ── CHECK 8: Fluff / generic buzzword penalty (–10) ──────────────────────────
  const FLUFF_RE = /(passionate about|hard[\s-]?working|team\s*player|fast\s*learner|detail[\s-]?oriented|highly motivated|self[\s-]?starter|go[\s-]?getter|dynamic professional|results[\s-]?driven|proven track record|synergy|think outside the box|out[\s-]?of[\s-]?the[\s-]?box|leverage|utilize|proactive individual|seasoned professional|ninja|rockstar|guru|wizard|visionary|thought leader|strategic thinker)/gi;
  const fluffMatches = content.match(FLUFF_RE) ?? [];
  const fluffCount = fluffMatches.length;

  if (fluffCount === 0) {
    score += 10; // bonus for clean, specific language
  } else if (fluffCount === 1) {
    score -= 3;
    issues.push(
      `Buzzword detected: "${fluffMatches[0]}". ` +
      "Replace it with a specific fact. Instead of 'highly motivated', say what you actually did: 'shipped 3 production features per sprint'."
    );
  } else {
    score -= 10;
    const quoted = fluffMatches.slice(0, 3).map(f => `"${f}"`).join(", ");
    issues.push(
      `${fluffCount} generic buzzwords found (${quoted}${fluffCount > 3 ? ", ..." : ""}). ` +
      "These phrases add no value and hurt ATS ranking. Replace each with a concrete skill, achievement, or fact. " +
      "E.g. 'team player' → 'collaborated with a 6-engineer team to deliver X on schedule'."
    );
  }

  return { found: true, score: Math.min(Math.max(score, 0), 100), content, issues };
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