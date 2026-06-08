"use client";

import { useEffect, useState } from "react";
import { getResumeData } from "../lib/storage";
import { analyzeResume } from "../lib/analyzer";

export default function AnalysisDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setData(getResumeData());
  }, []);

  if (!data) {
    return <p>Loading...</p>;
  }

  const analysis = analyzeResume(
  data.resumeText ?? "",
  data.jobDescription ?? ""
);

const atsLabel =
  analysis.atsScore >= 85
    ? "Excellent Match"
    : analysis.atsScore >= 70
    ? "Good Match"
    : analysis.atsScore >= 50
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
  Target Role
</h2>

<p>{data.jobDescription}</p>
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
        width: `${analysis.atsScore}%`,
      }}
    />
  </div>

  <p className="text-5xl font-bold mt-3">
    {analysis.atsScore}%
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
          {analysis.strengths.map(
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
          Suggestions
        </h2>

        <ul className="mt-4 space-y-2">
          {analysis.suggestions.map(
            (item, index) => (
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