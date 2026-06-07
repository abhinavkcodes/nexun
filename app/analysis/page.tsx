import ATSScoreCard from "../../components/ATSScoreCard";
import SkillGapCard from "../../components/SkillGapCard";
import ExperienceScoreCard from "../../components/ExperienceScoreCard";
import StarSuggestionsCard from "../../components/StarSuggestionsCard";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Analysis Results
      </h1>

      <ATSScoreCard />
      <SkillGapCard />
      <ExperienceScoreCard />
      <StarSuggestionsCard />
    </div>
  );
}