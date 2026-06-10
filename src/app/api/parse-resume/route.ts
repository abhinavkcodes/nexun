// app/api/parse-resume/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Receives a PDF upload, runs the full analysis pipeline, and returns
// the complete AnalysisData shape consumed by AnalysisDashboard.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { extractPdfText } from "../../../lib/pdf";
import { analyzeResume } from "../../../lib/analyzer";
import { analyzeATS } from "../../../lib/atsEngine";
import { detectRole } from "../../../lib/roleDetector";
import { analyzeResumeIntelligence } from "../../../lib/resumeIntelligence";
import { analyzeSections } from "../../../lib/sectionAnalyzer";
import { generateResumePreview }
from "../../../lib/resumePreview";

// ── Keyword lists used to build the keyword coverage panel ───────────────────
// These are common ATS-relevant terms across roles.
const COMMON_KEYWORDS = [
  "python", "javascript", "typescript", "react", "node.js", "next.js",
  "sql", "postgresql", "mongodb", "docker", "kubernetes", "aws", "git",
  "machine learning", "api", "rest api", "graphql", "tensorflow", "pytorch",
  "pandas", "numpy", "express", "tailwind", "css", "html", "java",
  "data structures", "algorithms", "ci/cd", "linux", "agile", "scrum",
];

// ── Resume strength label ────────────────────────────────────────────────────
function getResumeStrength(
  score: number
): "Weak" | "Fair" | "Good" | "Strong" | "Excellent" {
  if (score >= 88) return "Excellent";
  if (score >= 74) return "Strong";
  if (score >= 58) return "Good";
  if (score >= 40) return "Fair";
  return "Weak";
}

// ── Section health rows for the dashboard ───────────────────────────────────
function buildSectionRows(sectionAnalysis: ReturnType<typeof analyzeSections>) {
  return [
    { name: "Skills",          ...sectionAnalysis.skills },
    { name: "Experience",      ...sectionAnalysis.experience },
    { name: "Projects",        ...sectionAnalysis.projects },
    { name: "Education",       ...sectionAnalysis.education },
    { name: "Certifications",  ...sectionAnalysis.certifications },
    { name: "Achievements",    ...sectionAnalysis.achievements },
  ].map(({ name, score, found }) => ({
    name,
    score,
    status: (
      !found         ? "missing"  :
      score >= 70    ? "good"     :
                       "warning"
    ) as "good" | "warning" | "missing",
  }));
}

// ── Handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resumeText = await extractPdfText(buffer);

    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json(
        { success: false, error: "Could not extract text from PDF. Make sure it is not scanned." },
        { status: 400 }
      );
    }

    // ── Run the analysis pipeline ────────────────────────────────────────────
    const roleResult   = detectRole(resumeText);
    const roleAnalysis = analyzeResume(resumeText, roleResult.role);
    const intelligence = analyzeResumeIntelligence(resumeText);
    const atsResult    = analyzeATS(resumeText, roleAnalysis, intelligence);
    const sectionAnalysis = analyzeSections(resumeText);

    // ── Build keyword coverage ───────────────────────────────────────────────
    const resumeLower = resumeText.toLowerCase();
    const keywords = COMMON_KEYWORDS.map((word) => ({
      word,
      found: resumeLower.includes(word),
    }));

    // ── Assemble the final AnalysisData shape ────────────────────────────────
  const analysisData = {
  fileName: file.name,

  overallScore: atsResult.overallScore,
  atsScore: atsResult.atsCompliance.score,

  experienceScore: atsResult.experienceScore,
  projectScore: atsResult.projectScore,

  skillMatch: atsResult.roleMatchScore,

  keywordScore: atsResult.keywordDensityScore,

  readabilityScore: intelligence.readabilityScore,

  wordCount: intelligence.wordCount,
  pageCount: intelligence.pageCount,

  resumeStrength: getResumeStrength(atsResult.overallScore),

  jobTitle: roleResult.role,

  recruiterSummary: atsResult.recruiterSummary,

  skillGaps: roleAnalysis.missingSkills,
  matchedSkills: roleAnalysis.matchedSkills,

  suggestions: atsResult.suggestions,

  redFlags: atsResult.redFlags,

  experienceStrengths:
    intelligence.experienceStrengths ?? [],

  experienceWeaknesses:
    intelligence.experienceWeaknesses ?? [],

  projectStrengths:
    intelligence.projectStrengths ?? [],

  projectWeaknesses:
    intelligence.projectWeaknesses ?? [],

  keywords,

  sections: buildSectionRows(sectionAnalysis),
};
    return NextResponse.json({
      success: true,
      fileName:     file.name,
      fileSize:     file.size,
      fileType:     file.type,
      resumeText,
      analysisData,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { success: false, error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}