export function analyzeResume(
  resumeText: string,
  jobDescription: string
) {
  const jdWords = jobDescription
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const resumeLower =
    resumeText.toLowerCase();

  const matchedSkills = jdWords.filter(
    (word) =>
      resumeLower.includes(word)
  );

  const missingSkills = jdWords.filter(
    (word) =>
      !resumeLower.includes(word)
  );

  const atsScore = Math.round(
    (matchedSkills.length /
      Math.max(jdWords.length, 1)) *
      100
  );

  const suggestions = missingSkills.map(
    (skill) =>
      `Add ${skill} experience or projects to your resume`
  );

  return {
    atsScore,
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills: [...new Set(missingSkills)],
    suggestions,
  };
}