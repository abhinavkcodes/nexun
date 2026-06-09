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
            Stop struggling<br />
            with Resumes.<br />
            <em>Let AI do the<br />hard part.</em>
          </h1>

          <p className="hero-sub">
            From wording to formatting, our AI resume analyzer helps you create
            a polished resume that stands out in seconds.
          </p>

          <div className="hero-ctas">
            <Link href="/dashboard" className="cta-primary">
              Get Started — It&apos;s Free
            </Link>
            <Link href="/upload" className="cta-secondary">
              ↑ Upload My Resume
            </Link>
          </div>

          {/* Social proof */}
          <div className="social-proof">
            <div className="avatars">
              <img src="https://i.pravatar.cc/32?img=1" alt="user" />
              <img src="https://i.pravatar.cc/32?img=2" alt="user" />
              <img src="https://i.pravatar.cc/32?img=3" alt="user" />
            </div>
            <span className="proof-text">
              <strong>28,452</strong> landed interviews last month
            </span>
          </div>

          <div className="reviews-badge">
            <span className="check-icon">✓</span>
            <span>
              <strong>3,769</strong> Reviews on{" "}
              <a href="https://reviews.io" target="_blank" rel="noopener noreferrer">
                Reviews.io
              </a>
            </span>
          </div>
        </div>

        {/* RIGHT column — floating mock UI */}
        <div className="hero-right">
          {/* Main resume card */}
          <div className="resume-card">
            <div className="resume-toolbar">
              <button>B</button>
              <button><em>I</em></button>
              <button><u>U</u></button>
              <span className="toolbar-label">Selected Name</span>
            </div>

            <div className="resume-body">
              <div className="resume-name-row">
                <span className="resume-name-box">John Smith</span>
                <span className="resume-title-label">Software Engineer</span>
              </div>

              <div className="resume-contact">
                <span>✉ john@email.com</span>
                <span>📞 +1 555 000 000</span>
                <span>🌐 johnsmith.dev</span>
              </div>

              <p className="resume-summary">
                A passionate software engineer committed to building scalable,
                user-focused products with clean, efficient code.
              </p>

              <p className="resume-section-label">WORK EXPERIENCE</p>

              <div className="resume-job">
                <div className="resume-job-header">
                  <strong>Senior Software Engineer</strong>
                  <span className="resume-dates">Jan 2022 – Feb 2023</span>
                </div>
                <div className="resume-job-tags">
                  <span className="tag blue">Acme Corp</span>
                  <span className="tag gray">Contract</span>
                  <span className="tag gray">Remote</span>
                </div>
                <ul className="resume-bullets">
                  <li>Engineered responsive web apps with React and Node.js.</li>
                  <li>Conducted A/B testing to optimize user engagement.</li>
                  <li>Implemented accessibility standards for inclusive design.</li>
                  <li>Mentored junior devs in best practices and coding standards.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Floating score badge */}
          <div className="score-badge">
            <span className="score-label">Resume<br />Score</span>
            <div className="score-circle">96%</div>
            <button className="btn-optimize">+ Optimize</button>
          </div>

          {/* Floating AI chat bubble */}
          <div className="ai-chat-bubble">
            <div className="chat-question">
              <span className="chat-avatar">🤖</span>
              <span>Why is my resume weak?</span>
            </div>
            <div className="chat-answer">
              Your experience was strong.<br />The wording wasn&apos;t. Fixed it.
            </div>
            <button className="ask-ai-btn">+ Ask Nexun AI</button>
          </div>
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