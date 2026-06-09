import Navbar from "../components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <main className="home-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero">
        {/* LEFT column */}
        <div className="hero-left">
          <span className="hero-badge">One time purchase · No subscription</span>

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

          <div className="hero-ctas">
            <Link href="/dashboard" className="cta-primary">
             Analyze My Resume
            </Link>
            <Link href="/upload" className="cta-secondary">
              View Sample Report
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