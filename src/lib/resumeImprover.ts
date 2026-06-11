/**
 * resumeImprover.ts
 *
 * Applies safe, non-fabricating improvements to resume sections based on
 * analysis suggestions and missing skills.
 *
 * IMPORTANT: This module NEVER invents metrics, achievements, or bullet points.
 * It only surfaces real content from the resume and appends genuinely missing
 * structural information (skills, links) that the user should fill in.
 */

export interface ImprovementResult {
  improved: any;
  changelog: string[];   // human-readable list of what was changed and why
  warnings: string[];    // things we couldn't fix automatically
}

export function improveResume(
  sections: any,
  suggestions: string[],
  missingSkills: string[]
): ImprovementResult {
  // Deep clone so we never mutate the original sections object
  const improved = structuredClone(sections);
  const changelog: string[] = [];
  const warnings: string[] = [];

  // ── 1. Missing skills — append only if not already present ──────────────────
  if (missingSkills.length > 0) {
    const existingContent = (improved.skills?.content ?? "").toLowerCase();
    const newSkills = missingSkills.filter(
      (skill) => !existingContent.includes(skill.toLowerCase())
    );
    if (newSkills.length > 0) {
      improved.skills.content += "\n" + newSkills.join(", ");
      changelog.push(
        `Added ${newSkills.length} missing skill(s) to Skills section: ${newSkills.join(", ")}.`
      );
    }
  }

  // ── 2. Missing GitHub link placeholder ──────────────────────────────────────
  // We only add a clearly-labelled placeholder — never a fake URL
  const suggestsGitHub = suggestions.some((s) => s.toLowerCase().includes("github"));
  const alreadyHasGitHub = /(github\.com|github)/i.test(improved.projects?.content ?? "");
  if (suggestsGitHub && !alreadyHasGitHub) {
    improved.projects.content +=
      "\n[Add your GitHub repository URL here — e.g. github.com/yourusername/project]";
    changelog.push(
      "Added a GitHub link placeholder to Projects — replace with your actual repo URL."
    );
  }

  // ── 3. Missing date ranges placeholder ──────────────────────────────────────
  const suggestsDates = suggestions.some((s) => s.toLowerCase().includes("date"));
  const hasDates = /\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|present|current)/i.test(
    improved.experience?.content ?? ""
  );
  if (suggestsDates && !hasDates) {
    improved.experience.content +=
      "\n[Add date ranges to experience entries — e.g. Jun 2023 – Present]";
    changelog.push(
      "Added a date range placeholder to Experience — fill in your actual start/end dates."
    );
  }

  // ── 4. Warn about issues we cannot safely fix automatically ─────────────────
  const needsMetrics = suggestions.some((s) =>
    s.toLowerCase().includes("measurable") || s.toLowerCase().includes("quantif")
  );
  if (needsMetrics) {
    warnings.push(
      "Your experience or projects lack quantified metrics. " +
      "We can't add these automatically — review each bullet point and add real numbers: " +
      "users served, % improvements, team size, time saved, etc."
    );
  }

  const needsActionVerbs = suggestions.some((s) =>
    s.toLowerCase().includes("action verb")
  );
  if (needsActionVerbs) {
    warnings.push(
      "Some bullet points start with weak or missing action verbs. " +
      "Replace them with strong verbs (Built, Architected, Reduced, Led, Delivered) — " +
      "we can't rewrite your bullets automatically without knowing the context."
    );
  }

  return { improved, changelog, warnings };
}