"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveResumeData } from "../lib/storage";

export default function UploadResume() {
  const router = useRouter();

  const [resumeFile, setResumeFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function handleAnalyze() {
    if (!resumeFile) return;

    setLoading(true);

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

    const result =
      await response.json();

    saveResumeData({
      fileName: result.fileName,
      fileSize: result.fileSize,
      fileType: result.fileType,
      resumeText: result.resumeText,
    });

    router.push("/analysis");
  }

  return (
    <section className="grid lg:grid-cols-2 gap-16 items-center">

      {/* LEFT SIDE */}

      <div>

        <div className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
          AI Resume Intelligence Platform
        </div>

        <h1 className="text-6xl font-bold leading-tight text-slate-900">
          Get Expert Feedback
          <br />
          on your{" "}
          <span className="text-blue-600">
            Resume
          </span>
          , instantly.
        </h1>

        <p className="mt-6 text-xl text-slate-600 max-w-xl">
          Upload your resume and receive
          ATS analysis, role detection,
          recruiter insights, strengths,
          weaknesses and improvement
          suggestions in seconds.
        </p>

        {/* Upload Box */}

        <div className="mt-10 bg-white border-2 border-dashed border-blue-300 rounded-3xl p-8 shadow-lg">

          <p className="text-center text-slate-600 mb-6">
            Upload PDF Resume
          </p>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file =
                e.target.files?.[0];

              if (file) {
                setResumeFile(file);
              }
            }}
            className="w-full"
          />

          {resumeFile && (
            <p className="mt-4 text-sm text-green-600">
              ✓ {resumeFile.name}
            </p>
          )}

          <button
            disabled={
              !resumeFile || loading
            }
            onClick={handleAnalyze}
            className="
            w-full
            mt-6
            bg-blue-600
            hover:bg-blue-700
            text-white
            py-4
            rounded-xl
            font-semibold
            transition
            disabled:opacity-50
            "
          >
            {loading
              ? "Analyzing..."
              : "Analyze Resume"}
          </button>
        </div>

        <div className="mt-8 flex gap-8 text-slate-600">

          <div>
            <div className="font-bold text-2xl">
              ATS
            </div>

            <div>
              Resume Checker
            </div>
          </div>

          <div>
            <div className="font-bold text-2xl">
              AI
            </div>

            <div>
              Resume Builder
            </div>
          </div>

          <div>
            <div className="font-bold text-2xl">
              Role
            </div>

            <div>
              Match Analysis
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="relative">

        <div className="bg-white rounded-3xl shadow-2xl p-8 border">

          <div className="flex justify-between mb-8">
            <div>
              <h2 className="font-bold text-2xl">
                Resume Score
              </h2>

              <p className="text-slate-500">
                ATS Intelligence
              </p>
            </div>

            <div className="text-green-600 text-5xl font-bold">
              96%
            </div>
          </div>

          <div className="space-y-4">

            <div>
              <div className="flex justify-between">
                <span>Impact</span>
                <span>92%</span>
              </div>

              <div className="h-3 bg-slate-200 rounded mt-2">
                <div className="h-3 bg-green-500 rounded w-[92%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between">
                <span>Projects</span>
                <span>89%</span>
              </div>

              <div className="h-3 bg-slate-200 rounded mt-2">
                <div className="h-3 bg-blue-500 rounded w-[89%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between">
                <span>Skills</span>
                <span>95%</span>
              </div>

              <div className="h-3 bg-slate-200 rounded mt-2">
                <div className="h-3 bg-purple-500 rounded w-[95%]" />
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}