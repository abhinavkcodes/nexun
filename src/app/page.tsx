
"use client";

import Navbar from "../components/Navbar";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
const router = useRouter();

const [isScanning, setIsScanning] = useState(false);
const handleResumeUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setIsScanning(true);

  try {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch("/api/parse-resume", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      console.error("API error:", result.error);
      setIsScanning(false);
      alert("Analysis failed: " + (result.error ?? "Unknown error"));
      return;
    }

    localStorage.setItem(
  "analysisData",
  JSON.stringify({
    ...result.analysisData,
    resumeText: result.resumeText,
  })
);

    router.push("/analysis");

  } catch (err) {
    console.error("Upload error:", err);
    setIsScanning(false);
    alert("Something went wrong. Please try again.");
  }
};
  return (
    <main className="home-page">
     
      {/* ── HERO ── */}
      <section className="hero">
        {/* LEFT column */}
        <div className="hero-left">

          <h1 className="hero-heading">
  <span className="heading-light">
        Get More Interviews

  </span>

  <span className="heading-dark">
    Fix Your Resume in Seconds.
  </span>
</h1>

         <p className="hero-sub">
  Upload your resume and receive ATS scoring,
  keyword optimization, recruiter insights,
  and actionable improvements in seconds.
</p>

          <input
  ref={fileInputRef}
  type="file"
  accept=".pdf,.doc,.docx"
  style={{ display: "none" }}
  onChange={handleResumeUpload}
/>

<div className="hero-ctas">
  <button
  className="cta-primary"
  disabled={isScanning}
  onClick={() => fileInputRef.current?.click()}
>
  {isScanning ? "Scanning Resume..." : "Analyze My Resume"}
</button>

 
</div>

          {/* Social proof */}
          <div className="social-proof">
            <div className="avatars">
              
              <img src="pic1.webp" alt="user" />
              <img src="pic2.webp" alt="user" />
              <img src="pic3.webp" alt="user" />
            </div>
              

            <span className="proof-text">
              <strong>1000+</strong> resumes analyzed
            </span>
            
        
          </div>

         <div className="hero-trust">
  ATS Friendly • AI Powered • Recruiter Focused
</div>
        </div>

        {/* RIGHT column — floating mock UI */}
        
          <div className="hero-right">
            
  <div className="hero-dots"></div>
  


            <div className="mockup-wrapper">
  <div className="resume-card browser-window">
  <div className="browser-header">
  <div className="browser-left">
    <div className="browser-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <div className="browser-nav">
      <span>‹</span>
      <span>›</span>
    </div>
  </div>

  <div className="browser-address">
    nexun.ai
  </div>

  <div className="browser-right">
    <span>+</span>
  </div>
</div>

  <div className="browser-content">
    <img
      src="/AnalysisPage.png"
      alt="ATS Analysis"
      className="analysis-preview"
    />
    
  </div>
  
</div>

</div>


          {/* Floating score badge */}
      

          {/* Floating AI chat bubble */}
         
        </div>
      </section>
      
<section className="hero-marquee">
  <div className="marquee-track">
    <div className="marquee-content">
      <span>✦ ATS Compatible</span>
      <span>✦ AI Resume Analysis</span>
      <span>✦ Keyword Optimization</span>
      <span>✦ Recruiter Insights</span>
      <span>✦ Resume Scoring</span>
      <span>✦ Instant Feedback</span>
    </div>

    <div className="marquee-content">
      <span>✦ ATS Compatible</span>
      <span>✦ AI Resume Analysis</span>
      <span>✦ Keyword Optimization</span>
      <span>✦ Recruiter Insights</span>
      <span>✦ Resume Scoring</span>
      <span>✦ Instant Feedback</span>
    </div>
  </div>
</section>
      {/* ── TRUSTED BY ── */}
     
    </main>
  );
}