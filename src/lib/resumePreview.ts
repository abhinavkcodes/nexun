export function generateResumePreview(text: string) {
  return text
    .split("\n")
    .filter(line => line.trim())
    .slice(0, 40)
    .map(line => ({
      type: "bullet",
      text: line.trim(),
    }));
}