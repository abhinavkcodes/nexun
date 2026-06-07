import AnalysisDashboard from "../../components/AnalysisDashboard";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Analysis Results
      </h1>

      <AnalysisDashboard />
    </div>
  );
}