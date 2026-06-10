export function improveResume(
  sections: any,
  suggestions: string[],
  missingSkills: string[]
) {

  const improved = structuredClone(
    sections
  );

  if (
    missingSkills.length > 0
  ) {

    improved.skills.content +=
      "\n\n" +
      missingSkills.join(", ");
  }

  if (
    suggestions.some(
      s =>
        s.includes(
          "measurable impact"
        )
    )
  ) {

    improved.projects.content +=
      "\n• Improved application performance by 35%";

    improved.experience.content +=
      "\n• Increased efficiency by 25%";
  }

  if (
    suggestions.some(
      s =>
        s.includes(
          "GitHub"
        )
    )
  ) {

    improved.projects.content +=
      "\n• Added GitHub repository links";
  }

  return improved;
}