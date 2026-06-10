  "use client";
  import { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";


  import { getResumeData } from "../lib/storage";
  import { analyzeResume } from "../lib/analyzer";
  import { analyzeResumeIntelligence } from "../lib/resumeIntelligence";
  import { analyzeATS }
  from "../lib/atsEngine";
  import { detectRole }
  from "../lib/roleDetector";

  export default function AnalysisDashboard() {
    const [data, setData] = useState<any>(null);
const router = useRouter();
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
  const interviewReadiness =
    Math.round(
      (
        ats.overallScore +
        ats.roleMatchScore
      ) / 2
    );

  const majorImprovements = [
    ...ats.weaknesses,
    ...ats.suggestions
  ].slice(0, 3);

  
  console.log(
    "HAS NEXUN:",
    data.resumeText.includes("Nexun")
  );

  console.log(
    "HAS MEDITRACK:",
    data.resumeText.includes("MediTrack")
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

    <div className="flex gap-6 max-w-[1600px] mx-auto p-6">
      {/* LEFT PANEL */}

  <div className="w-[38%] sticky top-6 h-[calc(100vh-48px)]">

    <div className="
    bg-white
    rounded-3xl
    border
    border-slate-200
    h-full
    overflow-hidden
    ">

    <div className="
rounded-3xl
overflow-hidden
bg-gradient-to-r
from-indigo-700
to-purple-700
p-10
text-white
">

<p className="
uppercase
tracking-widest
text-indigo-200
text-sm
">
NEXUN ATS BUILDER
</p>

<h2 className="
text-4xl
font-bold
mt-3
">
Build ATS-Friendly Resume
</h2>

<p className="
mt-4
max-w-xl
text-indigo-100
">
Automatically rewrite weak sections,
add missing keywords,
improve ATS score,
and generate a recruiter-ready resume.
</p>

<div className="
mt-8
flex
items-center
gap-4
">

<div className="
text-5xl
font-bold
">
{ats.overallScore}
</div>

<div className="text-2xl">
→
</div>

<div className="
text-5xl
font-bold
">
{Math.min(
ats.overallScore + 15,
100
)}
</div>

</div>

<button
onClick={() => router.push("/builder")}
className="
mt-8
bg-white
text-black
font-semibold
px-6
py-3
rounded-xl
"
>
Build Resume →
</button>

</div>

      <div className="
      p-5
      overflow-y-auto
      h-full
      ">

        <pre className="
whitespace-pre-wrap
text-[13px]
leading-7
font-light
text-slate-700
">
          {data.resumeText}
        </pre>

      </div>

    </div>

  </div>

  {/* RIGHT PANEL */}
 

  <div className="flex-1 space-y-6">
  <div className="
  bg-white
  rounded-3xl
  border
  border-slate-200
  p-10
  shadow-sm
  ">

    <div className="
    flex
    items-center
    justify-between
    flex-wrap
    gap-4
    ">

      <div>

        <p className="
        text-xs
        uppercase
        tracking-widest
        text-gray-500
        ">
          Recruiter Verdict
        </p>

        <div className="flex items-center gap-8 mt-4">

  <div className="
  h-32
  w-32
  rounded-full
  border-[10px]
  border-green-500
  flex
  items-center
  justify-center
  ">

    <span className="text-4xl font-bold">
      {interviewReadiness}
    </span>

  </div>

  <div>

    <h2 className="text-5xl font-bold">
      Strong Candidate
    </h2>

    <p className="text-gray-500 mt-2">
      Likely to pass recruiter screening.
    </p>

  </div>

</div>

        <p className="
        text-xl
        font-medium
        mt-3
        ">
          Strong Candidate
        </p>

      </div>

      <div className="
      px-5
      py-3
      rounded-2xl
      bg-green-50
      text-green-700
      font-semibold
      ">
        {detectedRole.role}
      </div>

    </div>

  <p className="
mt-8
text-gray-600
leading-8
max-w-3xl
">
  {ats.recruiterSummary}
</p>

  </div>

        <div className="
  bg-white
  rounded-3xl
  border
  border-slate-200
  p-8
  shadow-sm
  ">

  <h2 className="
  text-2xl
  font-bold
  ">
  Major Improvements
  </h2>

  <p className="
  text-gray-500
  mt-2
  ">
  These changes will improve your resume the fastest.
  </p>

  <div className="
  grid
  md:grid-cols-3
  gap-4
  mt-6
  ">

  {majorImprovements.map((item,index)=>(
  <div
  key={index}
  className="
  p-5
  rounded-2xl
  bg-orange-50
  border
  border-orange-100
  "
  >

  <div className="
  text-sm
  font-bold
  text-orange-600
  ">
  Priority #{index+1}
  </div>

  <p className="
  mt-3
  text-gray-700
  ">
  {item}
  </p>

  </div>
  ))}

  </div>

  </div>
<div className="
bg-green-50
rounded-3xl
border
border-green-200
p-8
">

<p className="text-green-700 text-sm">
Predicted ATS Score
</p>

<h2 className="text-6xl font-bold mt-2 text-green-700">
{Math.min(
ats.overallScore + 15,
100
)}
</h2>

</div>
        

       <div className="grid md:grid-cols-3 gap-4">

  <div className="
bg-gradient-to-br
from-indigo-600
to-indigo-800
text-white
rounded-3xl
p-8
">

<p className="text-indigo-200 text-sm">
ATS Score
</p>

<h2 className="text-6xl font-bold mt-3">
{ats.overallScore}
</h2>

<p className="mt-4 text-indigo-100">
{atsLabel}
</p>

</div>

  <div className="bg-white rounded-3xl border p-6">

  <p className="text-sm text-gray-500">
    Resume Quality
  </p>

  <h2 className="text-5xl font-bold mt-3">
    {intelligence.resumeQualityScore}
  </h2>

</div>
  <div className="bg-white rounded-3xl border p-6">
    <p className="text-sm text-gray-500">
      Interview Readiness
    </p>

    <h2 className="text-5xl font-bold mt-3">
      {interviewReadiness}
    </h2>
  </div>

</div>
<div className="
bg-white
rounded-3xl
border
border-slate-200
p-8
">

<h2 className="text-2xl font-bold mb-6">
ATS Compliance
</h2>

<div className="grid md:grid-cols-4 gap-4">

<div className="p-4 rounded-2xl bg-slate-50">
Email {ats.atsCompliance.checks.email ? "✅" : "❌"}
</div>

<div className="p-4 rounded-2xl bg-slate-50">
Phone {ats.atsCompliance.checks.phone ? "✅" : "❌"}
</div>

<div className="p-4 rounded-2xl bg-slate-50">
LinkedIn {ats.atsCompliance.checks.linkedin ? "✅" : "❌"}
</div>

<div className="p-4 rounded-2xl bg-slate-50">
GitHub {ats.atsCompliance.checks.github ? "✅" : "❌"}
</div>

</div>

</div>
 <div className="
bg-white
rounded-3xl
border
border-slate-200
p-8
">

<h2 className="
text-2xl
font-bold
mb-6
">
Section Analysis
</h2>
<div className="
bg-white
rounded-3xl
border
border-slate-200
p-8
">

<h2 className="
text-2xl
font-bold
mb-6
">
Career Insights
</h2>

<div className="
grid
grid-cols-3
gap-4
">

<div className="
p-5
rounded-2xl
bg-indigo-50
">
<p>Detected Role</p>
<p className="text-xl font-bold mt-2">
{detectedRole.role}
</p>
</div>

<div className="
p-5
rounded-2xl
bg-green-50
">
<p>Strongest Area</p>
<p className="text-xl font-bold mt-2">
{
ats.projectScore >= ats.experienceScore
? "Projects"
: "Experience"
}
</p>
</div>

<div className="
p-5
rounded-2xl
bg-yellow-50
">
<p>Needs Work</p>
<p className="text-xl font-bold mt-2">
{
ats.metricsScore < 60
? "Impact Metrics"
: "Skills Coverage"
}
</p>
</div>

</div>

</div>

<div className="
grid
grid-cols-2
md:grid-cols-3
gap-4
">

<div className="bg-green-50 rounded-2xl p-5">
  <p>Experience</p>
  <p className="text-3xl font-bold">
    {ats.sectionAnalysis.experience.score}
  </p>
</div>

<div className="bg-green-50 rounded-2xl p-5">
  <p>Projects</p>
  <p className="text-3xl font-bold">
    {ats.sectionAnalysis.projects.score}
  </p>
</div>

<div className="bg-yellow-50 rounded-2xl p-5">
  <p>Skills</p>
  <p className="text-3xl font-bold">
    {ats.sectionAnalysis.skills.score}
  </p>
</div>

<div className="bg-green-50 rounded-2xl p-5">
  <p>Achievements</p>
  <p className="text-3xl font-bold">
    {ats.sectionAnalysis.achievements.score}
  </p>
</div>

<div className="bg-yellow-50 rounded-2xl p-5">
  <p>Education</p>
  <p className="text-3xl font-bold">
    {ats.sectionAnalysis.education.score}
  </p>
</div>

<div className="bg-yellow-50 rounded-2xl p-5">
  <p>Certifications</p>
  <p className="text-3xl font-bold">
    {ats.sectionAnalysis.certifications.score}
  </p>
</div>

</div>

</div>
<div className="
bg-white
rounded-3xl
border
border-slate-200
p-8
">

<h2 className="
text-2xl
font-bold
mb-6
">
Resume Strengths
</h2>

<div className="space-y-4">

{ats.strengths.map(
(item,index)=>(
<div
key={index}
className="
p-4
rounded-2xl
bg-green-50
border
border-green-100
"
>
✅ {item}
</div>
)
)}

</div>

</div>

<div className="
bg-white
rounded-3xl
border
border-slate-200
p-8
">

<h2 className="
text-2xl
font-bold
mb-6
">
Recruiter Concerns
</h2>

<div className="space-y-4">

{ats.redFlags.length === 0 ? (
<div
className="
p-4
rounded-2xl
bg-green-50
border
border-green-100
"
>
✅ No major recruiter concerns detected.
</div>
) : (
ats.redFlags.map((flag,index)=>(
<div
key={index}
className="
p-4
rounded-2xl
bg-red-50
border
border-red-100
"
>
🚨 {flag}
</div>
))
)}

</div>

</div>
<div className="
bg-white
rounded-3xl
border
border-slate-200
p-8
">

<h2 className="
text-2xl
font-bold
mb-6
">
Interview Questions Predictor

</h2>

<div className="space-y-3">

{[
"Tell me about your strongest project.",
"What was the biggest technical challenge you solved?",
"Why did you choose this technology stack?",
"How would you improve your project if rebuilding today?",
"Describe a measurable impact you created."
].map((q,index)=>(
<div
key={index}
className="
p-4
rounded-2xl
bg-slate-50
border
border-slate-100
"
>
{q}
</div>
))}

</div>

</div>
        
        


       

        

        <div className="
  bg-white
  rounded-2xl
  shadow-lg
  border
  border-slate-200
  p-6
  ">
         <h2 className="font-bold text-xl">
  Missing Skills
</h2>

<p className="text-sm text-gray-500 mt-1">
Role Match Score: {analysis.roleMatchScore}%
</p>
<div className="flex flex-wrap gap-2 mt-4">

{detectedRole.matchedKeywords.map(
(keyword,index)=>(
<div
key={index}
className="
px-3
py-1
rounded-full
bg-green-50
text-green-700
text-sm
font-medium
"
>
{keyword}
</div>
)
)}

</div>
          <div className="
flex
flex-wrap
gap-3
mt-4
">

{analysis.missingSkills.map(
(skill,index)=>(
<div
key={index}
className="
px-4
py-2
rounded-full
bg-red-50
text-red-700
font-medium
"
>
{skill}
</div>
)
)}

</div>
        </div>

        
          

        </div>

      </div>
      
    );
  }