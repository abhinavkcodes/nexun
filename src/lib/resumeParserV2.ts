export interface ParsedProject {
  title: string;
  description: string;
}

export interface ParsedExperience {
  role: string;
  company: string;
  description: string;
}

export interface ParsedResumeV2 {
  name: string;
  skills: string[];
  projects: ParsedProject[];
  experience: ParsedExperience[];
  education: string;
  certifications: string[];
}

export function parseResumeV2(
  resumeText: string
): ParsedResumeV2 {

  const lines = resumeText
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
    const name =
  lines[0] || "";

  const skills: string[] = [];
  const certifications: string[] = [];

  const projects: ParsedProject[] = [];
  const experience: ParsedExperience[] = [];

  let education = "";

  let currentSection = "";

  for (const line of lines) {

    const lower =
      line.toLowerCase();

    if (
      lower.includes(
        "technical skills"
      )
    ) {
      currentSection =
        "skills";
      continue;
    }

    if (
      lower === "projects"
    ) {
      currentSection =
        "projects";
      continue;
    }

    if (
      lower.includes(
        "professional experience"
      )
    ) {
      currentSection =
        "experience";
      continue;
    }

    if (
      lower === "education"
    ) {
      currentSection =
        "education";
      continue;
    }

    if (
      lower.includes(
        "certifications"
      )
    ) {
      currentSection =
        "certifications";
      continue;
    }

    switch (
      currentSection
    ) {

      case "skills":

        if (
          line.includes(":")
        ) {

          const parts =
            line.split(":");

          if (
            parts[1]
          ) {

            skills.push(
              ...parts[1]
                .split(",")
                .map(
                  s =>
                    s.trim()
                )
                .filter(
                  Boolean
                )
            );

          }
        }

        break;

      case "projects":

if (
  !line.startsWith("•") &&
  projects.length === 0
) {
  projects.push({
    title: line,
    description: ""
  });
}
else if (
  !line.startsWith("•") &&
  (
    line.includes("System") ||
    line.includes("Platform")
  )
) {
  projects.push({
    title: line,
    description: ""
  });
}
else if (projects.length) {
  projects[
    projects.length - 1
  ].description +=
    "\n" + line;
}

break;

        if (
          line.includes("—") ||
          line.includes("|")
        ) {

          projects.push({
            title:
              line,
            description:
              ""
          });

        } else if (
          projects.length
        ) {

          projects[
            projects.length - 1
          ].description +=
            " " + line;

        }

        break;

      case "experience":

        if (
          line.includes("—")
        ) {

          const parts =
            line.split("—");

          experience.push({
            role:
              parts[0]
                ?.trim() ||
              "",
            company:
              parts[1]
                ?.trim() ||
              "",
            description:
              ""
          });

        } else if (
          experience.length
        ) {

          experience[
            experience.length - 1
          ].description +=
            " " + line;

        }

        break;

      case "education":

        education +=
          line + "\n";

        break;

      case "certifications":

        certifications.push(
          line
        );

        break;
    }
  }

  return {
  name,
  skills,
  projects,
  experience,
  education,
  certifications
};
}