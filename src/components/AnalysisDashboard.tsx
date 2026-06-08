"use client";

import { useEffect, useState } from "react";
import { getResumeData } from "../lib/storage";
import { analyzeResume } from "../lib/analyzer";

export default function AnalysisDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const storedData = getResumeData();
    setData(storedData);
  }, []);

  if (!data) {
    return (
      <div className="p-6">
        Loading analysis...
      </div>
    );
  }

  const analysis = analyzeResume(
    data.resumeText ?? "",
    data.jobDescription ?? ""
  );

  return (
    <div className="space-y-4">

      <div className="border p-4 rounded">
        <h2 className="font-bold">
          Resume File
        </h2>

        <p>{data?.fileName}</p>

        <p>Size: {data?.fileSize} bytes</p>

        <p>Type: {data?.fileType}</p>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-bold">
          Job Description
        </h2>

        <p>
          {data?.jobDescription}
        </p>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-bold">
          Extracted Resume Text
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
      <span
  className={
    analysis.atsScore >= 80
      ? "text-green-500"
      : analysis.atsScore >= 60
      ? "text-yellow-500"
      : "text-red-500"
  }
>
  {analysis.atsScore}%
</span>
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
    <div className="border p-4 rounded">
  <h2 className="font-bold text-xl">
    Suggestions
  </h2>
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

    <p className="text-5xl font-bold mt-3">
      {analysis.missingSkills.length}
    </p>
  </div>

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
        </h2>

        <pre className="whitespace-pre-wrap text-sm mt-2">
          {data?.resumeText}
        </pre>
      </div>

    </div>
  );
}