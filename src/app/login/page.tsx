"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/dashboard",
      },
    });
  };

  const loginWithEmail = async () => {
    if (!email) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/dashboard",
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Check your email for the login link."
      );
    }

    setLoading(false);
  };

  return (
    <main className="signin-page">
      <div className="signin-card">

        <div className="logo-circle">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
          >
            <polygon points="12 2 20 7 20 17 12 22 4 17 4 7 12 2" />
          </svg>
        </div>

        <h1>Sign in to Nexun</h1>

        <p className="subtitle">
          Welcome back! Please sign in to continue
        </p>

        <button
          className="google-button"
          onClick={loginWithGoogle}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
          />
          <span>Continue with Google</span>
        </button>

        <div className="divider">
          <span></span>
          <p>or</p>
          <span></span>
        </div>

        <div className="input-group">
          <label>Email address</label>

          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <button
          className="continue-btn"
          onClick={loginWithEmail}
          disabled={loading}
        >
          {loading ? "Sending..." : "Continue"}
        </button>

        {message && (
          <p
            style={{
              marginTop: 12,
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}