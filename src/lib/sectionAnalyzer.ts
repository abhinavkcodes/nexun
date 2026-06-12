/**
 * sectionAnalyzer.ts  (v3 — fixes + improvements)
 *
 * Changes from v2:
 *  - TECH_RE hoisted to module scope (was inaccessible in scoreProjectsSection)
 *  - Bullet regex now tolerates leading whitespace (PDF extraction artifact)
 *  - Experience scorer checks for role/company name presence
 *  - Achievements + Certifications base score lowered (was inflating scores)
 *  - Projects: improved tech-stack detection using shared TECH_RE
 *  - All "not found" messages are actionable, not just labels
 *  - Skills: detects comma-separated inline lists even without bullet chars
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

// ─── Section heading patterns ─────────────────────────────────────────────────

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

// ─── Shared regexes ───────────────────────────────────────────────────────────

// FIX: hoisted from scoreProfessionalSummary so all scorers can use it
const TECH_RE =
  /(python|javascript|typescript|react|angular|vue|node\.?js|java|kotlin|swift|go|golang|rust|c\+\+|c#|\.net|ruby|rails|php|laravel|django|flask|fastapi|spring|express|sql|postgresql|mysql|mongodb|redis|docker|kubernetes|aws|gcp|azure|terraform|linux|git|graphql|rest\s+api|machine\s+learning|deep\s+learning|nlp|pytorch|tensorflow|scikit[\s-]learn|pandas|spark|hadoop|tableau|power\s*bi|excel)/gi;

const METRIC_RE =
  /(\d+\.?\d*\s*%|\d[\d,]*\+|\$[\d,]+[km]?|\d+[km]\+?|\d+\s*(users|customers|clients|projects|downloads|stars|requests|records|issues|members|students|participants|teams|countries))/gi;

// FIX: leading \s* tolerates spaces that PDF extractors add before bullet chars
const BULLET_RE = /^\s*[•\-*▸►✓✦◆▪]/m;

function countBullets(content: string): number {
  const explicitBullets = (content.match(/^\s*[•\-*▸►✓✦◆▪]/gm) ?? []).length;
  // PDF extraction often strips bullet characters — count lines that start
  // with a capital action verb as implicit bullets
  const implicitBullets = (content.match(
    /^\s*(Analyzed|Built|Collaborated|Created|Delivered|Deployed|Designed|Developed|Engineered|Implemented|Improved|Integrated|Launched|Led|Maintained|Managed|Mentored|Migrated|Optimized|Reduced|Refactored|Scaled|Shipped|Streamlined|Automated|Architected|Conducted|Coordinated|Generated|Resolved|Surfaced)/gm
  ) ?? []).length;
  return explicitBullets + implicitBullets;
}
// ─── Section scorers ──────────────────────────────────────────────────────────

function scoreProfessionalSummary(content: string): SectionResult {
  if (!content.trim()) {
    return {
      found: false, score: 60, content: "",
      issues: [
  "Professional summary is optional but recommended."
]
      ,
    };
  }

  const issues: string[] = [];
  let score = 10;

  const words = content.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // CHECK 1: Length (15 pts)
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
    issues.push(
      `Summary is very short (${wordCount} words) — this reads like a placeholder. ` +
      "Write 3–5 sentences: who you are, what you bring, and what you're looking for."
    );
  }

  // CHECK 2: Role / Title mention (15 pts)
  const ROLE_RE =
    /(software\s+engineer|frontend|back[\s-]?end|full[\s-]?stack|data\s+scientist|data\s+analyst|ml\s+engineer|devops|cloud\s+engineer|product\s+manager|ui\/ux|ux\s+designer|web\s+developer|mobile\s+developer|android|ios\s+developer|engineer|developer|analyst|designer|manager|scientist|consultant|specialist|architect|intern|researcher|programmer)/i;
  if (ROLE_RE.test(content)) {
    score += 15;
  } else {
    issues.push(
      "Your job title/role is not mentioned in the summary. " +
      "Start with a clear identity statement, e.g. 'Full Stack Developer', 'Data Analyst', or 'Backend Engineer'."
    );
  }

  // CHECK 3: Years of experience (10 pts)
  const hasYoe =
    /(\d+\+?\s*years?\s*(of)?\s*(experience|exp|background|expertise|practice))|(\bentry[\s-]level\b|\bfresher\b|\brecent\s+graduate\b)/i.test(
      content
    );
  if (hasYoe) {
    score += 10;
  } else {
    issues.push(
      "Experience level is not stated. Add a signal like '3+ years of experience', '2 years building ...', " +
      "or if you're entry-level, say 'recent Computer Science graduate' or 'entry-level developer'."
    );
  }

  // CHECK 4: Hard technical skills (15 pts)
  const techMatches = content.match(new RegExp(TECH_RE.source, "gi")) ?? [];
  const uniqueTechSkills = new Set(techMatches.map((s) => s.toLowerCase())).size;

  if (uniqueTechSkills >= 3) {
    score += 15;
  } else if (uniqueTechSkills >= 1) {
    score += 8;
    issues.push(
      `Only ${uniqueTechSkills} technical skill(s) detected in summary. ` +
      "Include 2–3 of your strongest skills so recruiters and ATS can immediately identify your stack."
    );
  } else {
    issues.push(
      "No recognisable technical skills found in summary. " +
      "Name your top 2–3 technologies/tools (e.g. 'React, Node.js, PostgreSQL') to pass ATS keyword filters."
    );
  }

  // CHECK 5: Quantified achievement or impact (15 pts)
  const hasMetric = METRIC_RE.test(content);
  const hasImpactVerb =
    /(increased|reduced|improved|saved|delivered|built|launched|scaled|optimised|optimized|boosted|cut|grew|led|shipped|deployed)/i.test(
      content
    );

  if (hasMetric) {
    score += 15;
  } else if (hasImpactVerb) {
    score += 7;
    issues.push(
      "Good — you used an impact verb, but no numbers were found. " +
      "Add a metric: e.g. 'reduced load time by 40%', 'built a system serving 10k+ users', 'improved test coverage from 45% to 90%'."
    );
  } else {
    issues.push(
      "No quantified achievement found in summary. " +
      "Include at least one number or result: e.g. 'delivered 5 production features', 'reduced bug count by 30%', 'led a team of 4 engineers'."
    );
  }

  // CHECK 6: Value proposition / career goal (10 pts)
  const hasGoal =
    /(seeking|looking for|aspiring|passionate about building|focused on|specialising in|specializing in|with a focus on|aiming to|goal is|passionate about|interested in)/i.test(
      content
    );
  const hasDomain =
    /(fintech|edtech|healthtech|e[\s-]?commerce|saas|startup|enterprise|b2b|b2c|open[\s-]?source|distributed\s+systems|real[\s-]?time|embedded|systems\s+programming|backend\s+systems|data\s+engineering|platform|infrastructure|product)/i.test(
      content
    );

  if (hasGoal || hasDomain) {
    score += 10;
  } else {
    issues.push(
      "Summary doesn't communicate what kind of role or domain you're targeting. " +
      "Add a closing line like 'seeking a backend engineering role at a growth-stage startup' or 'focused on data engineering and real-time analytics'."
    );
  }

  // CHECK 7: First-person 'I' penalty
  const firstPersonCount = (content.match(/\bI\b/g) ?? []).length;
  if (firstPersonCount >= 2) {
    score -= 8;
    issues.push(
      `Found ${firstPersonCount} uses of 'I' in the summary — remove all of them. ` +
      "Use the implied first person: start sentences with your role or strong verbs. " +
      "Bad: 'I am a developer who built...' → Good: 'Full Stack Developer who built...'"
    );
  } else if (firstPersonCount === 1) {
    score -= 3;
    issues.push(
      "Avoid using 'I' in your resume summary. " +
      "Replace with your title or a verb: 'I designed...' → 'Designed...'"
    );
  }

  // CHECK 8: Fluff/buzzword penalty
  const FLUFF_RE =
    /(passionate about|hard[\s-]?working|team\s*player|fast\s*learner|detail[\s-]?oriented|highly motivated|self[\s-]?starter|go[\s-]?getter|dynamic professional|results[\s-]?driven|proven track record|synergy|think outside the box|out[\s-]?of[\s-]?the[\s-]?box|leverage|utilize|proactive individual|seasoned professional|ninja|rockstar|guru|wizard|visionary|thought leader|strategic thinker)/gi;
  const fluffMatches = content.match(FLUFF_RE) ?? [];
  const fluffCount = fluffMatches.length;

  if (fluffCount === 0) {
    score += 10;
  } else if (fluffCount === 1) {
    score -= 3;
    issues.push(
      `Buzzword detected: "${fluffMatches[0]}". ` +
      "Replace it with a specific fact. Instead of 'highly motivated', say what you actually did: 'shipped 3 production features per sprint'."
    );
  } else {
    score -= 10;
    const quoted = fluffMatches.slice(0, 3).map((f) => `"${f}"`).join(", ");
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
    return {
      found: false, score: 0, content: "",
      issues: [
        "Skills section not found — add a dedicated section listing your technical skills.",
        "Group them by category for best ATS performance: e.g. 'Languages: Python, TypeScript | Frameworks: React, FastAPI | Tools: Docker, Git'.",
      ],
    };
  }

  const issues: string[] = [];
  let score = 20;

  const allSkills = content
    .split(/[\n,|•]/)
    .map((s) => s.replace(/.*?:/g, "").trim())
    .filter((s) => s.length > 1 && s.length < 50);

  const uniqueSkills = new Set(allSkills.map((s) => s.toLowerCase())).size;

  if (uniqueSkills >= 12) score += 25;
  else if (uniqueSkills >= 8) score += 20;
  else if (uniqueSkills >= 4) score += 10;
  else issues.push(`Only ${uniqueSkills} distinct skills detected — aim for at least 8–15 relevant skills.`);

  const categoryCount = (
    content.match(
      /\b(languages|frameworks|tools|databases|cloud|libraries|platforms|technologies|frontend|backend|devops|testing|mobile|ml|ai|data)\s*:/gi
    ) ?? []
  ).length;

  if (categoryCount >= 3) score += 20;
  else if (categoryCount >= 1) score += 10;
  else
    issues.push(
      "Group skills by category (e.g. 'Languages:', 'Frameworks:', 'Tools:') — this dramatically improves ATS parsing."
    );

  // FIX: also check for inline comma-separated lists even without category labels
  const commaListLines = content.split("\n").filter((l) => l.split(",").length >= 3);
  if (commaListLines.length >= 1 && categoryCount === 0) score += 5;

  // Check for recognisable tech skills using shared TECH_RE
  const recognisedTech = new Set(
    (content.match(new RegExp(TECH_RE.source, "gi")) ?? []).map((s) => s.toLowerCase())
  ).size;
  if (recognisedTech >= 5) score += 15;
  else if (recognisedTech >= 2) score += 8;
  else issues.push("Very few industry-standard technologies detected — make sure skill names match common ATS keywords exactly (e.g. 'Node.js' not 'NodeJS').");

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount > 300) {
    score -= 10;
    issues.push("Skills section appears to contain prose — keep it as a concise, scannable list.");
  }

  return { found: true, score: Math.min(score, 85), content, issues };
}

function scoreExperienceSection(content: string): SectionResult {
  if (!content.trim()) {
    return {
      found: false, score: 0, content: "",
      issues: [
        "Experience section not found — this is typically the most important section for ATS scoring.",
        "Add each role with: Job Title, Company, Date Range, and 3–5 bullet points describing impact.",
        "Use the STAR format: Situation → Task → Action → Result (with a number where possible).",
      ],
    };
  }

  const issues: string[] = [];
  // Raised base from 20 → 35. A student with one real internship shouldn't
  // start at 20 just because PDF strips bullet chars.
  let score = 15;

  const bulletCount = countBullets(content);
  if (bulletCount >= 6) score += 25;
  else if (bulletCount >= 3) score += 15;
  else if (bulletCount >= 1) score += 8;
  else issues.push(
    `Only ${bulletCount} bullet points detected — add at least 3–5 bullets per role describing your responsibilities and impact.`
  );

  const metricCount = (content.match(new RegExp(METRIC_RE.source, "gi")) ?? []).length;
  if (metricCount >= 3) score += 20;
  else if (metricCount >= 1) score += 12;
  else issues.push(
    "No quantified achievements found — add metrics to at least 2 bullets (e.g. 'reduced load time by 40%', 'served 10k+ daily users')."
  );

  const hasDateRanges =
    /\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|present|current)/i.test(content);
  if (hasDateRanges) score += 10;
  else issues.push("Add date ranges to each experience entry (e.g. Jun 2023 – Present).");

  const hasRoleSignal =
    /(engineer|developer|intern|analyst|manager|designer|lead|associate|consultant|specialist|architect)/i.test(content);
  if (hasRoleSignal) score += 5;

  const actionVerbs =
    /(built|developed|designed|led|architected|engineered|optimized|reduced|improved|increased|launched|deployed|automated|streamlined|collaborated|mentored|managed|delivered|created|implemented|integrated|refactored|migrated|shipped|maintained|researched|analysed|analyzed)/gi;
  const verbCount = (content.match(actionVerbs) ?? []).length;
  if (verbCount >= 4) score += 5;

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreProjectsSection(content: string): SectionResult {
  if (!content.trim()) {
    return {
      found: false, score: 0, content: "",
      issues: [
        "Projects section not found — for CS students and new grads, projects are your strongest proof of skills.",
        "Add 2–4 projects with: Project Name, tech stack, your role, and a measurable outcome.",
        "Include GitHub links or live URLs — recruiters will check.",
      ],
    };
  }

  const issues: string[] = [];
  // Raised base from 25 → 35 for same reason as experience
  let score = 15;

  const bulletCount = countBullets(content);
  if (bulletCount >= 4) score += 15;
  else if (bulletCount >= 2) score += 10;
  else issues.push("Add bullet-point descriptions to each project — describe what you built, how, and what it achieved.");

  const metricCount = (content.match(new RegExp(METRIC_RE.source, "gi")) ?? []).length;
  if (metricCount >= 2) score += 20;
  else if (metricCount === 1) score += 10;
  else issues.push(
    "No measurable outcomes found — add numbers: users, performance improvement, lines of code, stars, uptime, etc."
  );

  const hasLinks =
    /(github\.com|gitlab\.com|vercel\.app|netlify\.app|render\.com|live demo|deployed at|demo link|hosted at)/i.test(content);
  if (hasLinks) score += 15;
  else issues.push("Add a GitHub link or live demo URL for each project.");

  const techFound = new Set(
    (content.match(new RegExp(TECH_RE.source, "gi")) ?? []).map((s) => s.toLowerCase())
  ).size;
  if (techFound >= 3) score += 15;
  else if (techFound >= 1) score += 8;
  else issues.push(
    "Tech stack not clearly mentioned — list the technologies used in each project."
  );

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreEducationSection(content: string): SectionResult {
  if (!content.trim()) {
    return {
      found: false, score: 60, content: "",
      issues: [
        "Education section not found — add your degree, institution, and graduation year.",
      ],
    };
  }

  const issues: string[] = [];
  let score = 20; // FIX: was 40, base must be earned

  const hasDegree =
    /(b\.?tech|b\.?e\.?|b\.?sc|m\.?tech|m\.?sc|bachelor|master|phd|mba|diploma|associate|b\.?a\.?|m\.?a\.?)/i.test(
      content
    );
  if (hasDegree) score += 25;
  else issues.push("Degree type not clearly stated — include it explicitly (e.g. B.Tech, B.Sc, MBA, Bachelor of Science).");

  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(content);
  if (hasYear) score += 20;
  else issues.push("Add your graduation year (or expected graduation year) to your education entry.");

  const hasGPA =
    /(cgpa|gpa|percentage|grade|9\.\d|8\.\d|\d{2}%)/i.test(content);
  if (hasGPA) score += 15;
  else issues.push("Consider adding your GPA or percentage if it is above average (e.g. CGPA: 8.5/10 or 85%).");

  const hasInstitution = content.split(/\s+/).filter(Boolean).length >= 5;
  if (!hasInstitution) issues.push("Institution name appears to be missing from the education section.");

  // Check for field of study
  const hasField =
    /(computer science|information technology|electronics|electrical|mechanical|civil|mathematics|physics|statistics|data science|ai|artificial intelligence)/i.test(
      content
    );
  if (hasField) score += 10;

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreCertificationsSection(content: string): SectionResult {
  if (!content.trim()) {
    return {
      found: false, score: 0, content: "",
      issues: [
        "Certifications section not found.",
        "Adding industry-recognised certifications (AWS, Google, Microsoft, Meta, etc.) can significantly boost your ATS score.",
        "Even free Coursera / edX certificates are worth listing if relevant to the role.",
      ],
    };
  }

  const issues: string[] = [];
  let score = 15; // FIX: was 40

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 30) score += 20;
  else if (wordCount >= 10) score += 10;
  else issues.push("Certifications section is very short — list the full certification name, issuing body, and year.");

  const knownCerts =
    /(aws|google|microsoft|azure|gcp|oracle|cisco|comptia|pmp|scrum|agile|salesforce|meta|coursera|udemy|edx|linkedin learning|hackerrank|leetcode|nptel|isro|nasscom)/i.test(
      content
    );
  if (knownCerts) score += 25;
  else
    issues.push(
      "No widely-recognised certification bodies detected — try to include at least one well-known cert (AWS, Google Cloud, Microsoft, Meta, etc.)."
    );

  const bulletCount = countBullets(content);
  if (bulletCount >= 2) score += 10;

  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(content);
  if (hasYear) score += 15;
  else issues.push("Add the year each certification was obtained or is valid until (e.g. AWS Solutions Architect — 2024).");

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreAchievementsSection(content: string): SectionResult {
  if (!content.trim()) {
    return {
      found: false, score: 0, content: "",
      issues: [
        "Achievements / Awards section not found.",
        "Add academic awards, hackathon wins, competitive programming rankings, scholarships, or published work.",
        "Even one strong achievement (e.g. 'Top 5% in national coding contest') differentiates you from hundreds of similar resumes.",
      ],
    };
  }

  const issues: string[] = [];
  let score = 10; // FIX: was 40

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 30) score += 15;
  else if (wordCount >= 10) score += 8;
  else issues.push("Achievements section is very short — each entry should have the award name, the awarding body, and the year.");

  const bulletCount = countBullets(content);
  if (bulletCount >= 2) score += 15;
  else issues.push("Use bullet points for each achievement to improve readability.");

  const metricCount = (content.match(new RegExp(METRIC_RE.source, "gi")) ?? []).length;
  if (metricCount >= 2) score += 20;
  else if (metricCount >= 1) score += 10;
  else
    issues.push(
      "Quantify your achievements where possible (e.g. 'Ranked top 5% out of 2,000 participants', 'Awarded ₹50,000 scholarship')."
    );

  // Tier-1 signals
  const tier1 =
    /(winner|hackathon|ranked|top \d|award|scholarship|fellowship|national|international|first place|gold|silver|bronze|finalist|runner[\s-]?up)/i.test(
      content
    );
  if (tier1) score += 15;
  else
    issues.push(
      "Strong signal words not found — if applicable, include the scope: 'national', 'international', '1st place', 'finalist', etc."
    );

  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(content);
  if (hasYear) score += 10;
  else issues.push("Add the year for each achievement.");

  return { found: true, score: Math.min(score, 100), content, issues };
}

function scoreLeadershipSection(content: string): SectionResult {
  if (!content.trim()) {
    return {
      found: false, score: 0, content: "",
      issues: [
        "Leadership & Activities section not found.",
        "Add clubs, college committees, volunteering, open-source contributions, or community roles.",
        "This section matters more than most candidates realise — it shows initiative and soft skills that technical sections can't.",
      ],
    };
  }

  const issues: string[] = [];
  let score = 15;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 40) score += 20;
  else if (wordCount >= 15) score += 10;
  else issues.push("Add more detail to your leadership/activities entries — describe your role and what you achieved or organised.");

  const bulletCount = countBullets(content);
  if (bulletCount >= 2) score += 15;

  const leadershipKw =
    /(president|vice president|secretary|treasurer|captain|lead|head|coordinator|organizer|organiser|chair|founder|co-founder|officer|director|mentor|tutor|representative|ambassador)/i.test(
      content
    );
  if (leadershipKw) score += 15;
  else
    issues.push(
      "Highlight your formal title if you held one (President, Lead, Coordinator, Mentor, etc.) — these are strong differentiators."
    );

  const metricCount = (content.match(new RegExp(METRIC_RE.source, "gi")) ?? []).length;
  if (metricCount >= 1) score += 10;
  else
    issues.push(
      "Add scale to at least one entry (e.g. 'Led a team of 12', 'Organised events attended by 200+ students', 'Mentored 8 juniors')."
    );

  const hasYear = /\b(20\d{2}|19\d{2})\b/.test(content);
  if (hasYear) score += 10;
  else issues.push("Add dates to your leadership/activity entries.");

  return { found: true, score: Math.min(score, 85), content, issues };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function analyzeSections(resumeText: string): SectionAnalysis {

  const certificationsSection =
    extractSection(resumeText, SECTION_PATTERNS.certifications);

  const achievementsSection =
    extractSection(resumeText, SECTION_PATTERNS.achievements);

  const certificationFallback =
    certificationsSection ||
    (
      /nptel|coursera|udemy|aws|azure|gcp|oracle|meta/i.test(
        achievementsSection
      )
        ? achievementsSection
        : ""
    );

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
  certificationFallback
),
    achievements: scoreAchievementsSection(
      extractSection(resumeText, SECTION_PATTERNS.achievements)
    ),
    leadership: scoreLeadershipSection(
      extractSection(resumeText, SECTION_PATTERNS.leadership)
    ),
  };
}