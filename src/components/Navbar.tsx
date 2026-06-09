"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">Nexun</span>
        </Link>

        {/* Center nav links */}
        <div className="navbar-links">
          <Link href="#features">Features</Link>
          <Link href="#resume">Resume</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="#faqs">FAQs</Link>
        </div>

        {/* Right auth buttons */}
        <div className="navbar-actions">
          <Link href="/signin" className="btn-ghost">Sign In</Link>
          <Link href="/dashboard" className="btn-primary">Analyze My Resume</Link>
        </div>
      </div>
    </nav>
  );
}