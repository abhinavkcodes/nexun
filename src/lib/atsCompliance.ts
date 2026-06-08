export interface ATSComplianceResult {
  score: number;

  checks: {
    email: boolean;
    phone: boolean;
    linkedin: boolean;
    github: boolean;
  };

  warnings: string[];
  strengths: string[];
}

export function analyzeATSCompliance(
  resumeText: string
): ATSComplianceResult {
  const text = resumeText.toLowerCase();

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
    text.includes("linkedin.com") ||
    text.includes("linkedin");

  const github =
    text.includes("github.com") ||
    text.includes("github");

  if (email) {
    score += 25;
    strengths.push("Email detected");
  } else {
    warnings.push("Missing email address");
  }

  if (phone) {
    score += 25;
    strengths.push("Phone number detected");
  } else {
    warnings.push("Missing phone number");
  }

  if (linkedin) {
    score += 25;
    strengths.push("LinkedIn profile detected");
  } else {
    warnings.push("Missing LinkedIn profile");
  }

  if (github) {
    score += 25;
    strengths.push("GitHub profile detected");
  } else {
    warnings.push("Missing GitHub profile");
  }

  return {
    score,
    checks: {
      email,
      phone,
      linkedin,
      github,
    },
    warnings,
    strengths,
  };
}