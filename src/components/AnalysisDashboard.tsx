"use client";

import { getResumeData } from "../lib/storage";

export default function AnalysisDashboard() {
  const data = getResumeData();

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
          {data?.jobDescription ?? "No job description"}
        </p>
      </div>

    </div>
  );
}   