
"use client";
import {
  Zap,
  Target,
  ChartNoAxesColumn
} from "lucide-react";
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
     {/* FEATURES */}
<section id="features" className="features-section">
  <div className="section-header">
    <h2>Everything you need to optimize your resume</h2>
    <p>
      Powerful AI tools designed to help you pass ATS systems
      and impress recruiters.
    </p>
  </div>

  <div className="features-grid">
    <div className="feature-card">
     <div className="feature-icon">
  <Zap size={18} strokeWidth={2.2} />
</div>
      <h3>ATS Analysis</h3>
      <p>
        Instantly scan your resume for ATS compatibility and
        formatting issues.
      </p>
    </div>

    <div className="feature-card">
   <div className="feature-icon">
  <Target size={18} strokeWidth={2.2} />
</div>
      <h3>Keyword Optimization</h3>
      <p>
        Discover missing keywords recruiters and hiring systems
        are looking for.
      </p>
    </div>

    <div className="feature-card">
<div className="feature-icon">
  <ChartNoAxesColumn
    size={18}
    strokeWidth={2.2}
  />
</div>
      <h3>Resume Scoring</h3>
      <p>
        Get a detailed score with personalized recommendations.
      </p>
    </div>
  </div>
</section>

{/* HOW IT WORKS */}

<section id="how-it-works" className="workflow-section">

  <div className="workflow-header">
    <h2>How Nexun Works</h2>
    <p>
      Analyze your resume, identify weaknesses,
      and get recruiter-ready recommendations.
    </p>
  </div>

  {/* TOP STEPS */}
  <div className="steps-row">
<div className="step-item">
  <div className="step-number">1</div>

  <div className="step-content">
    <h3>Upload Resume</h3>

    <p>
      Upload your PDF or DOCX resume securely.
    </p>
  </div>
</div>

    <div className="step-arrow">→</div>

    <div className="step-item">
      <div className="step-number">2</div>

      <div>
        <h3>AI Analysis</h3>
        <p>
          ATS compatibility, keywords and recruiter checks.
        </p>
      </div>
    </div>

    <div className="step-arrow">→</div>

    <div className="step-item">
      <div className="step-number">3</div>

      <div>
        <h3>Improve & Stand Out
</h3>
        <p>
         Get clear recommendations to boost resume.
        </p>
      </div>
    </div>

  </div>

  {/* BOTTOM IMAGES */}
  <div className="workflow-images">

    <div className="workflow-image-card">
      <img
        src="/upload.png"
        alt="Upload Resume"
      />
    </div>

    <div className="workflow-image-card">
      <img
        src="/Analysis.png"
        alt="AI Analysis"
      />
    </div>

    <div className="workflow-image-card">
      <img
        src="/insight.png"
        alt="ATS Score"
      />
    </div>

  </div>

</section>
{/* FAQ */}
<section id="faq" className="faq-section">
  <div className="faq-container">
    <h2>Frequently Asked Questions</h2>

    <details className="faq-item">
      <summary>How does Nexun analyze my resume?</summary>
      <p>
        Nexun uses AI to evaluate ATS compatibility,
        keywords, formatting, and content quality.
      </p>
    </details>

    <details className="faq-item">
      <summary>Is my resume stored?</summary>
      <p>
        No. Your resume is processed securely and is not
        permanently stored.
      </p>
    </details>

    <details className="faq-item">
      <summary>Which file formats are supported?</summary>
      <p>
        PDF, DOC, and DOCX files are fully supported.
      </p>
    </details>

    <details className="faq-item">
      <summary>Is Nexun free?</summary>
      <p>
        Yes. Core resume analysis features are available free.
      </p>
    </details>
  </div>
</section>


    </main>
  );
}