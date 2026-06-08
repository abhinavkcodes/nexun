export interface ATSResult {
  overallScore: number;

  roleMatchScore: number;
  structureScore: number;
  experienceScore: number;
  projectScore: number;
  metricsScore: number;
  achievementScore: number;

  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}