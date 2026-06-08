

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
const SECTION_PATTERNS = {
  skills: [
    "skills",
    "technical skills",
    "technologies",
    "tech stack"
  ],

  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment"
  ],

  projects: [
    "projects",
    "personal projects",
    "academic projects"
  ],

  education: [
    "education",
    "academic background"
  ],

  certifications: [
    "certifications",
    "certificates",
    "licenses"
  ],

  achievements: [
    "achievements",
    "awards",
    "accomplishments"
  ]
};
function extractSection(
  text: string,
  keywords: string[]
): string {

  const lowerText = text.toLowerCase();

  let startIndex = -1;

  for (const keyword of keywords) {

    const index = lowerText.indexOf(keyword);

    if (index !== -1) {
      startIndex = index;
      break;
    }
  }

  if (startIndex === -1) {
    return "";
  }

  const remainingText = text.slice(startIndex);

  const lines = remainingText.split("\n");

  const contentLines: string[] = [];

  let started = false;

  for (const line of lines) {

    const trimmed = line.trim();

    if (!started) {
      started = true;
      continue;
    }

    const isLikelyHeading =
  trimmed.length > 0 &&
  trimmed.length < 40 &&
  /^[A-Za-z\s&]+$/.test(trimmed);

if (started && isLikelyHeading) {
  break;
}

    contentLines.push(line);
  }

  return contentLines.join("\n");
}
function scoreSection(
  content: string,
  sectionName: string
): SectionResult {

  if (!content) {
    return {
      found: false,
      score: 0,
      content: "",
      issues: [`Missing ${sectionName} section`]
    };
  }

  let score = 40;

  const issues: string[] = [];

  const wordCount =
    content.split(/\s+/).length;

  if (wordCount > 20) {
    score += 10;
  }

  if (wordCount > 50) {
    score += 10;
  }

  if (wordCount > 100) {
    score += 10;
  }

  const bulletCount =
    (content.match(/[-•*]/g) || []).length;

  if (bulletCount >= 3) {
    score += 10;
  }

  if (bulletCount >= 5) {
    score += 10;
  }

  const metricMatches =
    content.match(
      /\d+%|\d+\+|\$\d+|\d+\s(users|customers|projects|clients)/gi
    ) || [];

  score += Math.min(
    metricMatches.length * 5,
    10
  );

  if (wordCount < 20) {
    issues.push(
      `${sectionName} section is very short`
    );
  }

  if (score > 100) {
    score = 100;
  }

  return {
    found: true,
    score,
    content,
    issues
  };
}

export function analyzeSections(
  resumeText: string
): SectionAnalysis {

  const skillsContent = extractSection(
    resumeText,
    SECTION_PATTERNS.skills
  );

  const experienceContent = extractSection(
    resumeText,
    SECTION_PATTERNS.experience
  );

  const projectsContent = extractSection(
    resumeText,
    SECTION_PATTERNS.projects
  );

  const educationContent = extractSection(
    resumeText,
    SECTION_PATTERNS.education
  );

  const certificationsContent = extractSection(
    resumeText,
    SECTION_PATTERNS.certifications
  );

  const achievementsContent = extractSection(
    resumeText,
    SECTION_PATTERNS.achievements
  );

  return {
    skills: scoreSection(
      skillsContent,
      "Skills"
    ),

    experience: scoreSection(
      experienceContent,
      "Experience"
    ),

    projects: scoreSection(
      projectsContent,
      "Projects"
    ),

    education: scoreSection(
      educationContent,
      "Education"
    ),

    certifications: scoreSection(
      certificationsContent,
      "Certifications"
    ),

    achievements: scoreSection(
      achievementsContent,
      "Achievements"
    )
  };
}