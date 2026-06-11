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
<Link href="#cover-letter">
            FAQ
          </Link>
       
        </div>

        {/* Right Side */}
        <div className="navbar-actions">

          <Link
            href="/signin"
            className="btn-ghost"
          >
            Log In
          </Link>

          <Link
            href="/upload"
            className="btn-primary"
          >
            Sign Up
          </Link>

        </div>

      </div>
    </nav>
  );
}