"use client";
import { useEffect, useState } from "react";
import AnalysisDashboard from "../../components/AnalysisDashboard";

export default function AnalysisPage() {
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("analysisData");

    console.log("LOCAL STORAGE:", raw);

    if (raw) {
      setAnalysisData(JSON.parse(raw));
    }
  }, []);

  if (!analysisData)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500 text-sm">
          No analysis found. Please upload a resume first.
        </p>
      </div>
    );

  return (
    <AnalysisDashboard analysisData={analysisData} />
  );
}