"use client";

import { useEffect, useState } from "react";
import { getResumeData } from "../lib/storage";
import { analyzeResume } from "../lib/analyzer";
import { analyzeResumeIntelligence } from "../lib/resumeIntelligence";
import { analyzeATS }
from "../lib/atsEngine";
import { detectRole }
from "../lib/roleDetector";

export default function AnalysisDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setData(getResumeData());
  }, []);

  if (!data) {
    return <p>Loading...</p>;
  }
const detectedRole =
  detectRole(
    data.resumeText ?? ""
  );
  const analysis = analyzeResume(
  data.resumeText ?? "",
  detectedRole.role
);
const intelligence =
  analyzeResumeIntelligence(
    data.resumeText ?? ""
  );
  const ats = analyzeATS(
  data.resumeText,
  analysis,
  intelligence
);
console.log(data.resumeText);
console.log("ATS OBJECT");
console.log(ats);
console.log("SECTION ANALYSIS");
console.log(ats.sectionAnalysis);
 

const atsLabel =
  ats.overallScore >= 85
    ? "Excellent Match"
    : ats.overallScore >= 70
    ? "Good Match"
    : ats.overallScore >= 50
    ? "Average Match"
    : "Needs Improvement";

  return (
    <div className="space-y-6">

      <div className="border p-4 rounded">
        <h2 className="font-bold text-xl">
          Resume File
        </h2>

        <p>{data.fileName}</p>
        <p>Size: {data.fileSize} bytes</p>
        <p>Type: {data.fileType}</p>
      </div>

      <div className="border p-4 rounded">
  <h2 className="font-bold text-xl">
    Detected Role
  </h2>

  <p className="mt-2 text-lg font-semibold">
    {detectedRole.role}
  </p>

  <p className="text-sm text-gray-500">
    Confidence: {detectedRole.confidence}%
  </p>
</div>
<div className="border p-4 rounded">
  <h2 className="font-bold text-xl">
    Role Detection Signals
  </h2>

  <ul className="mt-2">
    {detectedRole.matchedKeywords.map(
      (
        keyword: string,
        index: number
      ) => (
        <li key={index}>
          ✅ {keyword}
        </li>
      )
    )}
  </ul>
</div>

      <div className="grid md:grid-cols-3 gap-4">

        <div className="border p-6 rounded">
  <h2 className="font-bold">
    ATS Score
  </h2>

  <div className="w-full bg-gray-700 rounded h-4 mt-4">
    <div
      className="bg-green-500 h-4 rounded"
      style={{
  width: `${ats.overallScore}%`,
}}
    />
  </div>

  <p className="text-5xl font-bold mt-3">
    {ats.overallScore}%
  </p>
  <p className="mt-2 text-lg">
  {atsLabel}
</p>
</div>

        <div className="border p-6 rounded">
          <h2 className="font-bold">
            Matched Skills
          </h2>

          <p className="text-5xl font-bold mt-3">
            {analysis.matchedSkills.length}
          </p>
        </div>

        <div className="border p-6 rounded">
          <h2 className="font-bold">
            Missing Skills
          </h2>

          <p className="text-5xl font-bold mt-3">
            {analysis.missingSkills.length}
          </p>
        </div>

      </div>

      <div className="border p-4 rounded">
        <h2 className="font-bold text-xl">
          Resume Strengths
        </h2>

        <ul className="mt-4 space-y-2">
          {ats.strengths.map(
            (item, index) => (
              <li key={index}>
                🚀 {item}
              </li>
            )
          )}
        </ul>
      </div>
      <div className="border p-4 rounded">
  <h2 className="font-bold text-xl">
    Resume Weaknesses
  </h2>

  <ul className="mt-4 space-y-2">
    {ats.weaknesses.map(
      (item: string, index: number) => (
        <li key={index}>
          ⚠️ {item}
        </li>
      )
    )}
  </ul>
</div>


      <div className="border p-4 rounded">
        <h2 className="font-bold text-xl">
          Suggestions
        </h2>

        <ul className="mt-4 space-y-2">
          {ats.suggestions.map(
            (item: string, index: number) => (
              <li key={index}>
                💡 {item}
              </li>
            )
          )}
        </ul>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-bold text-xl">
          Matched Skills
        </h2>

        <ul className="mt-2">
          {analysis.matchedSkills.map(
            (skill, index) => (
              <li key={index}>
                ✅ {skill}
              </li>
            )
          )}
        </ul>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-bold text-xl">
          Missing Skills
        </h2>

        <ul className="mt-2">
          {analysis.missingSkills.map(
            (skill, index) => (
              <li key={index}>
                ❌ {skill}
              </li>
            )
          )}
        </ul>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-bold text-xl">
          Extracted Resume Text
        </h2>

        <pre className="whitespace-pre-wrap text-sm mt-2">
          {data.resumeText}
        </pre>
      </div>

    </div>
  );
}