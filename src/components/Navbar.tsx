"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Get initials from email e.g. "themaxgamer.217@gmail.com" → "T"
  const getInitial = (email: string) => email.charAt(0).toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link
  href="/"
  className="navbar-logo"
  onClick={(e) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }}
>
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
          {user ? (
            // ✅ Logged in — avatar with dropdown
            <div className="profile-wrapper" ref={dropdownRef}>
           <button
  className="profile-avatar"
  onClick={() => setDropdownOpen(!dropdownOpen)}
  aria-label="Profile menu"
>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
</button>

              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-email">
                    {user.email}
                  </div>
                  <div className="profile-dropdown-divider" />
                  
                  <button
                    className="profile-dropdown-item profile-dropdown-logout"
                    onClick={logout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-ghost">
              Log In
            </Link>
          )}
          

         <Link
  href="/?upload=true"
  className="btn-primary analyze-btn"
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
</Link>
        </div>

      </div>
    </nav>
  );
}