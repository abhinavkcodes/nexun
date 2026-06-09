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

          <Link href="#features">
            Features
          </Link>

          <Link href="#how-it-works">
            How It Works
          </Link>

          <Link href="#cover-letter">
            Cover Letter
          </Link>

          {/* Resume Dropdown */}
         <div
  className="nav-dropdown"
  onMouseEnter={() => setResumeOpen(true)}
  onMouseLeave={() => setResumeOpen(false)}
>
  <button
    className="nav-dropdown-trigger"
    onClick={() => setResumeOpen(!resumeOpen)}
  >
    Resume ▾
  </button>

  {resumeOpen && (
    <div className="nav-dropdown-menu">
      <Link href="/analysis">Resume Checker</Link>
      <Link href="/builder">Resume Builder</Link>
      <Link href="/templates">Resume Templates</Link>
      <Link href="/examples">Resume Examples</Link>
    </div>
  )}
</div>

        </div>

        {/* Right Side */}
        <div className="navbar-actions">

          <Link
            href="/signin"
            className="btn-ghost"
          >
            Sign In
          </Link>

          <Link
            href="/upload"
            className="btn-primary"
          >
            Analyze Resume
          </Link>

        </div>

      </div>
    </nav>
  );
}