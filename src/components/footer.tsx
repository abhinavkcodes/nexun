"use client";

import { useState } from "react";

export default function Footer() {
  const [showContact, setShowContact] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>Nexun</h3>
            <p>Analyze. Optimize. Stand out.</p>
          </div>

          <nav className="footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
        
          </nav>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Nexun. All rights reserved.</p>
        </div>
      </div>

       
  
     
    </footer>
  );
}