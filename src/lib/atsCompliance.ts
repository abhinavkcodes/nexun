import { analyzeSections } from "./sectionAnalyzer";
export interface ATSComplianceResult {
  score: number;

  checks: {
    email: boolean;
    phone: boolean;
    linkedin: boolean;
    github: boolean;

    skillsSection: boolean;
    experienceSection: boolean;
    educationSection: boolean;
    projectsSection: boolean;
  };

  warnings: string[];
  strengths: string[];
}


    export function analyzeATSCompliance(
  resumeText: string
): ATSComplianceResult {

  const text = resumeText.toLowerCase();

  const sections =
    analyzeSections(resumeText);

  let score = 0;

  const warnings: string[] = [];
  const strengths: string[] = [];

  const email =
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(
      resumeText
    );

  const phone =
    /(\+91[\s-]?)?[6-9]\d{9}/.test(
      resumeText.replace(/\s/g, "")
    );

  const linkedin =
    text.includes("linkedin.com");

  const github =
    text.includes("github.com");

  const skillsSection =
    sections.skills.found;

  const experienceSection =
    sections.experience.found;

  const educationSection =
    sections.education.found;

  const projectsSection =
    sections.projects.found;
    if (email) {
  score += 10;
  strengths.push(
    "Professional email detected"
  );
} else {
  warnings.push(
    "Missing email address"
  );
}

if (phone) {
  score += 10;
  strengths.push(
    "Phone number detected"
  );
} else {
  warnings.push(
    "Missing phone number"
  );
}

if (linkedin) {
  score += 10;
  strengths.push(
    "LinkedIn profile detected"
  );
} else {
  warnings.push(
    "LinkedIn profile missing"
  );
}

if (github) {
  score += 10;
  strengths.push(
    "GitHub profile detected"
  );
} else {
  warnings.push(
    "GitHub profile missing"
  );
}
    if (skillsSection) {
  score += 15;
} else {
  warnings.push(
    "Skills section not found"
  );
}

if (experienceSection) {
  score += 15;
} else {
  warnings.push(
    "Experience section not found"
  );
}

if (educationSection) {
  score += 10;
} else {
  warnings.push(
    "Education section not found"
  );
}

if (projectsSection) {
  score += 10;
} else {
  warnings.push(
    "Projects section not found"
  );
}
if (resumeText.length > 1000) {
  score += 10;

  strengths.push(
    "Resume contains sufficient detail"
  );
} else {
  warnings.push(
    "Resume content appears limited"
  );
}

const metricCount =
  (
    resumeText.match(
      /\d+%|\d+\+/g
    ) || []
  ).length;

if (metricCount >= 2) {
  score += 10;

  strengths.push(
    "Contains measurable achievements"
  );
} else {
  warnings.push(
    "Few quantified achievements detected"
  );
}
return {
  score: Math.min(score, 100),

  checks: {
    email,
    phone,
    linkedin,
    github,

    skillsSection,
    experienceSection,
    educationSection,
    projectsSection,
  },

  warnings,
  strengths,
};
}