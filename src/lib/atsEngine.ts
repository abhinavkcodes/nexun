
    import {
    analyzeSections,
    SectionAnalysis
    } 
    from "./sectionAnalyzer";
    import { analyzeATSCompliance } from "./atsCompliance";
    export interface ATSResult {
    overallScore: number;

    roleMatchScore: number;
    structureScore: number;
    experienceScore: number;
    projectScore: number;
    metricsScore: number;
    achievementScore: number;

    sectionAnalysis: SectionAnalysis;

atsCompliance: {
  score: number;

  checks: {
    email: boolean;
    phone: boolean;
    linkedin: boolean;
    github: boolean;
  };

  warnings: string[];
  strengths: string[];
};

strengths: string[];
weaknesses: string[];
    suggestions: string[];
    redFlags: string[];
    recruiterSummary: string;
    }
    export function analyzeATS(
    resumeText: string,
    roleAnalysis: any,
    intelligence: any
    ): ATSResult {
        const sectionAnalysis = analyzeSections(resumeText);
        const compliance =
    analyzeATSCompliance(resumeText);
      const overallScore = Math.round(
  roleAnalysis.roleMatchScore * 0.30 +
  intelligence.structureScore * 0.15 +
  intelligence.projectScore * 0.20 +
  intelligence.experienceScore * 0.15 +
  intelligence.metricsScore * 0.10 +
  intelligence.achievementScore * 0.05 +
  compliance.score * 0.05
); const weaknesses: string[] = [];
const suggestions: string[] = [];
const redFlags: string[] = [];

const strengths: string[] = [
  ...roleAnalysis.strengths,
];

strengths.push(
  ...compliance.strengths
);

weaknesses.push(
  ...compliance.warnings
);
   
    if (!sectionAnalysis.skills.found) {
    weaknesses.push(
        "Skills section not detected"
    );

    suggestions.push(
        "Add a dedicated Skills section"
    );
    }

    if (!sectionAnalysis.projects.found) {
    weaknesses.push(
        "Projects section not detected"
    );

    suggestions.push(
        "Add a Projects section showcasing technical work"
    );
    }

    if (!sectionAnalysis.certifications.found) {
    suggestions.push(
        "Consider adding certifications"
    );
    }

    if (!sectionAnalysis.achievements.found) {
    suggestions.push(
        "Add achievements or awards"
    );
    }if (sectionAnalysis.skills.score >= 80) {
    strengths.push(
        "Well-structured skills section"
    );
    }

    if (sectionAnalysis.projects.score >= 80) {
    strengths.push(
        "Strong project section"
    );
    }

    if (sectionAnalysis.education.score >= 80) {
    strengths.push(
        "Clear education section"
    );
    }

    if (intelligence.structureScore < 80) {
        weaknesses.push(
        "Resume structure needs improvement"
        );

        suggestions.push(
        "Add clear sections for Skills, Experience, Projects and Certifications"
        );
    }

    if (intelligence.experienceScore < 60) {
        weaknesses.push(
        "Limited professional experience"
        );

        suggestions.push(
        "Include internships, freelance work or open-source contributions"
        );
    }

    if (intelligence.projectScore < 70) {
        weaknesses.push(
        "Projects lack technical depth"
        );

        suggestions.push(
        "Add more technically challenging projects with clear outcomes"
        );
    }

    if (intelligence.metricsScore < 60) {
        weaknesses.push(
        "Resume lacks measurable impact"
        );

        suggestions.push(
        "Add numbers such as users served, accuracy improvements or performance gains"
        );
    }

    if (
        roleAnalysis.missingSkills.length > 0
    ) {
        suggestions.push(
        `Add role-relevant skills: ${roleAnalysis.missingSkills.join(", ")}`
        );
    }

    if (
        intelligence.metricsScore >= 80
    ) {
        strengths.push(
        "Excellent use of quantified achievements"
        );
    }

    if (
        intelligence.projectScore >= 80
    ) {
        strengths.push(
        "Strong technical project portfolio"
        );
    }

    if (
        intelligence.achievementScore >= 80
    ) {
        strengths.push(
        "Strong achievements and competitive accomplishments"
        );
    }
    if (
    intelligence.experienceScore < 50
    ) {
    redFlags.push(
        "No significant professional experience"
    );
    }

    if (
    intelligence.projectScore < 50
    ) {
    redFlags.push(
        "Projects lack technical depth"
    );
    }

    if (
    roleAnalysis.missingSkills.length >= 3
    ) {
    redFlags.push(
        "Several important skills are missing"
    );
    }

    let recruiterSummary = "";

    if (overallScore >= 85) {
    recruiterSummary =
        "Strong candidate with solid technical skills, measurable achievements, and competitive project experience.";
    }
    else if (overallScore >= 70) {
    recruiterSummary =
        "Good candidate with relevant skills but there are a few gaps that should be addressed before applying broadly.";
    }
    else {
    recruiterSummary =
        "Resume needs significant improvements in skills, projects, and experience to become competitive.";
    }

   return {
  overallScore,

  roleMatchScore: roleAnalysis.roleMatchScore,
  structureScore: intelligence.structureScore,
  experienceScore: intelligence.experienceScore,
  projectScore: intelligence.projectScore,
  metricsScore: intelligence.metricsScore,
  achievementScore: intelligence.achievementScore,

  sectionAnalysis,
  atsCompliance: compliance,

  strengths,
  weaknesses,
  suggestions,
  redFlags,
  recruiterSummary,
};
    }