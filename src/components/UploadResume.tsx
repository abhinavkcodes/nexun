"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveResumeData } from "../lib/storage";

export default function UploadResume() {
  const router = useRouter();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [role, setRole] = useState(
  "software engineer"
);
  async function handleAnalyze() {
  if (!resumeFile) return;

  const formData = new FormData();

  formData.append(
    "resume",
    resumeFile
  );

  const response = await fetch(
    "/api/parse-resume",
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();

  saveResumeData({
  fileName: result.fileName,
  fileSize: result.fileSize,
  fileType: result.fileType,
  resumeText: result.resumeText,
  jobDescription: role,
});

  router.push("/analysis");
}

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        Upload Resume
      </h1>

      <div>
        <label className="block mb-2 font-medium">
          Resume PDF
        </label>

        <input
          type="file"
          accept=".pdf"
          className="border p-2 w-full rounded"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              setResumeFile(file);
            }
          }}
        />

        {resumeFile && (
          <p className="mt-2 text-sm">
            Selected File: {resumeFile.name}
          </p>
        )}
      </div>

      

      <button
        disabled={!resumeFile}
        onClick={handleAnalyze}
        className="bg-blue-600 text-white px-6 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Analyze Resume
      </button>
    </div>
  );
}