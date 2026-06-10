"use client";

import { getResumeData } from "../../lib/storage";
import { analyzeResume } from "../../lib/analyzer";
import { analyzeResumeIntelligence } from "../../lib/resumeIntelligence";
import { analyzeATS } from "../../lib/atsEngine";
import { detectRole } from "../../lib/roleDetector";

export default function BuilderPage() {

const data = getResumeData();

if (!data) {
return <p>No resume found.</p>;
}

const role =
detectRole(data.resumeText ?? "");

const analysis =
analyzeResume(
data.resumeText ?? "",
role.role
);

const intelligence =
analyzeResumeIntelligence(
data.resumeText ?? ""
);

const ats =
analyzeATS(
data.resumeText ?? "",
analysis,
intelligence
);

return (

<div className="max-w-7xl mx-auto p-8">

<h1 className="text-4xl font-bold mb-8">
ATS Resume Builder
</h1>

<div className="grid lg:grid-cols-2 gap-8">

{/* ORIGINAL */}

<div className="bg-white border rounded-3xl p-6">

<h2 className="text-2xl font-bold mb-4">
Original Resume
</h2>

<pre className="whitespace-pre-wrap text-sm">
{data.resumeText}
</pre>

</div>

{/* IMPROVEMENTS */}

<div className="bg-white border rounded-3xl p-6">

<h2 className="text-2xl font-bold mb-4">
ATS Improvements
</h2>

<div className="space-y-3">

{ats.suggestions.map(
(item,index)=>(
<div
key={index}
className="
p-4
rounded-xl
bg-green-50
"
>
✅ {item}
</div>
)
)}

</div>

</div>

</div>

</div>

);
}