"use client";

import { useEffect, useState } from "react";
import { getResumeData } from "../../lib/storage";
import { analyzeSections } from "../../lib/sectionAnalyzer";

export default function BuilderPage() {
  const [sections, setSections] =
    useState<any>(null);
    const [editing, setEditing] =
  useState(false);

  useEffect(() => {
    const data = getResumeData();

    if (!data?.resumeText) return;

    const extracted =
      analyzeSections(
        data.resumeText
      );

    setSections(extracted);
  }, []);

  if (!sections) {
  return (
    <div className="p-10">
      Loading...
    </div>
  );
}

if (!editing) {
  return (
    <div className="
    max-w-6xl
    mx-auto
    p-10
    space-y-8
    ">

      <div className="
      bg-gradient-to-r
      from-green-600
      to-emerald-600
      text-white
      rounded-3xl
      p-10
      ">

        <h1 className="
        text-4xl
        font-bold
        ">
          ATS Resume Generated
        </h1>

        <p className="mt-4">
          Nexun improved your resume
          for ATS systems.
        </p>

      </div>

      <div className="
      bg-white
      rounded-3xl
      border
      p-8
      ">

        <h2 className="
        text-2xl
        font-bold
        mb-6
        ">
          Improvements Applied
        </h2>

        <div className="space-y-4">

          <div>
            ✅ Improved ATS formatting
          </div>

          <div>
            ✅ Structured resume sections
          </div>

          <div>
            ✅ Ready for keyword optimization
          </div>

          <div>
            ✅ Improved readability
          </div>

        </div>

      </div>

      <button
        onClick={() =>
          setEditing(true)
        }
        className="
        bg-black
        text-white
        px-8
        py-4
        rounded-xl
        font-semibold
        "
      >
        Edit Resume
      </button>

    </div>
  );
}

  return (
    <div className="flex gap-6 p-6 max-w-[1700px] mx-auto">

      {/* LEFT */}

      <div className="w-[45%]">

        <div className="
        bg-white
        rounded-3xl
        border
        border-slate-200
        p-8
        sticky
        top-6
        ">

          <h2 className="
          text-2xl
          font-bold
          mb-6
          ">
            Live Resume Preview
          </h2>

          <div className="
          whitespace-pre-wrap
          text-sm
          leading-7
          text-slate-700
          ">

            <h3 className="font-bold">
              Skills
            </h3>

            {sections.skills.content}

            <br /><br />

            <h3 className="font-bold">
              Experience
            </h3>

            {sections.experience.content}

            <br /><br />

            <h3 className="font-bold">
              Projects
            </h3>

            {sections.projects.content}

            <br /><br />

            <h3 className="font-bold">
              Education
            </h3>

            {sections.education.content}

            <br /><br />

            <h3 className="font-bold">
              Certifications
            </h3>

            {sections.certifications.content}

          </div>

        </div>

      </div>

      {/* RIGHT */}

      <div className="flex-1 space-y-6">

        <EditorCard
          title="Skills"
          value={sections.skills.content}
          onChange={(v)=>
            setSections({
              ...sections,
              skills:{
                ...sections.skills,
                content:v
              }
            })
          }
        />

        <EditorCard
          title="Experience"
          value={
            sections.experience.content
          }
          onChange={(v)=>
            setSections({
              ...sections,
              experience:{
                ...sections.experience,
                content:v
              }
            })
          }
        />

        <EditorCard
          title="Projects"
          value={
            sections.projects.content
          }
          onChange={(v)=>
            setSections({
              ...sections,
              projects:{
                ...sections.projects,
                content:v
              }
            })
          }
        />

        <EditorCard
          title="Education"
          value={
            sections.education.content
          }
          onChange={(v)=>
            setSections({
              ...sections,
              education:{
                ...sections.education,
                content:v
              }
            })
          }
        />

        <EditorCard
          title="Certifications"
          value={
            sections.certifications.content
          }
          onChange={(v)=>
            setSections({
              ...sections,
              certifications:{
                ...sections.certifications,
                content:v
              }
            })
          }
        />

      </div>

    </div>
  );
}

interface EditorCardProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
}

function EditorCard({
  title,
  value,
  onChange
}: EditorCardProps){

  return(
    <div className="
    bg-white
    rounded-3xl
    border
    border-slate-200
    p-6
    ">

      <h2 className="
      text-xl
      font-bold
      mb-4
      ">
        {title}
      </h2>

      <textarea
        value={value}
        onChange={(e)=>
          onChange(
            e.target.value
          )
        }
        className="
        w-full
        h-48
        border
        rounded-xl
        p-4
        resize-none
        "
      />

    </div>
  );
}