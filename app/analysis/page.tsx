import ATSScoreCard from "../../components/ATSScoreCard";
import SkillGapCard from "../../components/SkillGapCard";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Analysis Results
      </h1>

      <ATSScoreCard />
      <SkillGapCard />
     
    </div>
  );
}