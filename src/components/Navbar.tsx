"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [resumeOpen, setResumeOpen] =
  useState(false);
  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">Nexun</span>
        </Link>

        {/* Center Navigation */}
        <div className="navbar-links">

          <Link href="/#features">Features</Link>
<Link href="/#how-it-works">How It Works</Link>
<Link href="/#faq">FAQ</Link>
       
        </div>

        {/* Right Side */}
        <div className="navbar-actions">

          <Link
            href="/login"
            className="btn-ghost"
          >
            Log In
          </Link>

     <button
  className="btn-primary analyze-btn"
  onClick={() => {
    document.getElementById("resume-upload")?.click();
  }}
>
  <span>Analyze Resume</span>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
</button>
        </div>

      </div>
    </nav>
  );
}