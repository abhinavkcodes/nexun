import { ResumeData } from "../types/resume";

const STORAGE_KEY = "nexun_resume";

export function saveResumeData(data: ResumeData) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}

export function getResumeData(): ResumeData | null {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
}