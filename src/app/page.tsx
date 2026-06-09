
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

  console.log("Uploaded Resume:", file);

  // fake ATS scan
  await new Promise((resolve) => setTimeout(resolve, 2500));

  router.push("/analysis");
};
  return (
    <main className="home-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero">
        {/* LEFT column */}
        <div className="hero-left">
          

          <h1 className="hero-heading">
  <span className="heading-light">
    Stop struggling with Resumes.
  </span>

  <span className="heading-dark">
    Let AI do the hard part.
  </span>
</h1>

          <p className="hero-sub">
  Upload your resume and get ATS scoring, recruiter insights,
  keyword optimization, and actionable improvements in seconds.
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

  <Link href="/upload" className="cta-secondary">
      Build Resume
  </Link>
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
      

      {/* ── TRUSTED BY ── */}
      <section className="trusted-by">
        <p className="trusted-label">Trusted by Professionals at top companies</p>
        <div className="trusted-logos">
          <span>Google</span>
          <span>Notion</span>
          <span>Zoom</span>
          <span>Coinbase</span>
          <span>Dropbox</span>
          <span>Medium</span>
        </div>
      </section>
    </main>
  );
}