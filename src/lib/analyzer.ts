export function analyzeResume(
  resumeText: string,
  jobDescription: string
) {
  const jdWords = jobDescription
    .toLowerCase()
    .split(/\s+/);

  const resumeLower =
    resumeText.toLowerCase();

  const matchedSkills = jdWords.filter(
    (word) =>
      word.length > 3 &&
      resumeLower.includes(word)
  );

  const uniqueMatches =
    [...new Set(matchedSkills)];

  const score = Math.min(
    100,
    Math.round(
      (uniqueMatches.length /
        Math.max(jdWords.length, 1)) *
        100
    )
  );

  const missingSkills =
    jdWords.filter(
      (word) =>
        word.length > 3 &&
        !resumeLower.includes(word)
    );

  return {
    atsScore: score,
    matchedSkills: uniqueMatches,
    missingSkills: [...new Set(missingSkills)],
  };
}