export function generateResumePreview(text: string) {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 60)
    .map(line => {

      // SECTION HEADINGS
      if (
        line === line.toUpperCase() &&
        line.length < 40
      ) {
        return {
          type: "section",
          text: line,
        };
      }

      // CONTACT
      if (
        line.includes("@") ||
        /\+?\d[\d\s-]{8,}/.test(line)
      ) {
        return {
          type: "contact",
          text: line,
        };
      }

      // SKILLS
      if (
        line.startsWith("Languages:") ||
        line.startsWith("Frontend:") ||
        line.startsWith("Backend:") ||
        line.startsWith("Tools:") ||
        line.startsWith("Databases:") ||
        line.startsWith("AI / ML:")
      ) {
        return {
          type: "skills",
          text: line,
        };
      }

      // NAME
      if (
        line === line.toUpperCase() &&
        line.split(" ").length <= 4 &&
        line.length < 35
      ) {
        return {
          type: "name",
          text: line,
        };
      }

      return {
        type: "bullet",
        text: line,
      };
    });
}