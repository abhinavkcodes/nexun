"use client";

import { useRouter } from "next/navigation";
export default function UploadResume() {
  const router = useRouter();
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
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Job Description
        </label>

        <textarea
          placeholder="Paste the job description here..."
          className="border p-3 w-full rounded h-40"
        />
      </div>

      <button
  onClick={() => router.push("/analysis")}
  className="bg-blue-600 text-white px-6 py-3 rounded"
>
  Analyze Resume
</button>

    </div>
  );
}