export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#F2F2F0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      overflowX: "hidden",
    }}>

      {/* HERO — full-width flex, no max-width constraint on right side */}
      <section style={{
        display: "flex",
        alignItems: "flex-start",
        minHeight: "calc(100vh - 60px)",
        paddingTop: 0,
      }}>

        {/* ── LEFT COLUMN ── fixed width, vertically centered */}
        <div style={{
          flexShrink: 0,
          width: 480,
          paddingLeft: 80,
          paddingTop: 120,
          paddingRight: 0,
        }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center",
            border: "1px solid #C5C5BF",
            borderRadius: 999, padding: "5px 16px",
            fontSize: 12.5, color: "#666",
            background: "transparent",
            marginBottom: 32,
          }}>
            One time purchase · No subscription
          </div>

          {/* Headline — large serif */}
          <h1 style={{
            margin: "0 0 22px",
            fontFamily: "Georgia, 'Times New Roman', serif",
            lineHeight: 1.08,
            letterSpacing: "-2px",
            fontSize: 62,
          }}>
            <span style={{ display: "block", fontWeight: 400, color: "#111", marginBottom: 2 }}>
              Stop struggling with Resumes.
            </span>
            <span style={{ display: "block", fontWeight: 900, color: "#111", fontStyle: "italic" }}>
              Let AI do the hard part.
            </span>
          </h1>

          {/* Subtext */}
          <p style={{ color: "#888", fontSize: 16, lineHeight: 1.65, marginBottom: 34, maxWidth: 400 }}>
            From wording to formatting, our AI resume builder helps you create a polished resume that stands out in seconds.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 44, flexWrap: "wrap" }}>
            <a href="/dashboard" style={{
              background: "#2563EB", color: "#fff",
              fontWeight: 600, fontSize: 14.5,
              padding: "13px 24px", borderRadius: 9,
              textDecoration: "none",
            }}>
              Get Started — It&apos;s Free
            </a>
            <a href="/upload" style={{
              border: "1.5px solid #C5C5BF",
              background: "rgba(255,255,255,0.5)",
              color: "#333", fontWeight: 500, fontSize: 14,
              padding: "12px 20px", borderRadius: 9,
              textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 7,
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8"/>
              </svg>
              Upload My Resume
            </a>
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex" }}>
                {[
                  "https://i.pravatar.cc/40?img=11",
                  "https://i.pravatar.cc/40?img=22",
                  "https://i.pravatar.cc/40?img=33",
                ].map((src, i) => (
                  <img key={i} src={src} alt="" width={32} height={32} style={{
                    borderRadius: "50%",
                    border: "2.5px solid #F2F2F0",
                    marginLeft: i === 0 ? 0 : -9,
                    objectFit: "cover",
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.4 }}>
                <strong style={{ color: "#111" }}>28,452</strong> landed<br />interviews last month
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                border: "2px solid #22C55E",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#22C55E" strokeWidth={2.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, color: "#666" }}>
                <strong style={{ color: "#111" }}>3,769</strong> Reviews on{" "}
                <a href="#" style={{ color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>Reviews.io</a>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — bleeds to edge ── */}
        <div style={{
          flex: 1,
          position: "relative",
          height: 660,
          marginLeft: 60,
          marginTop: 40,
        }}>

          {/* Profile photo — top, slightly overlapping */}
          <img
            src="https://i.pravatar.cc/100?img=12"
            alt="profile"
            width={90} height={90}
            style={{
              position: "absolute", top: 0, right: 140,
              borderRadius: "50%",
              border: "3px solid #F2F2F0",
              objectFit: "cover",
              zIndex: 6,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              filter: "grayscale(40%)",
            }}
          />

          {/* Google G — top right floating */}
          <div style={{
            position: "absolute", top: 10, right: 30, zIndex: 7,
            background: "#fff", borderRadius: 10,
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
            fontSize: 18, fontWeight: 900,
          }}>
            <span style={{ color: "#4285F4" }}>G</span>
          </div>

          {/* Meta M — left floating */}
          <div style={{
            position: "absolute", top: 220, left: -20, zIndex: 7,
            background: "#fff", borderRadius: 10,
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
            fontSize: 16, fontWeight: 900, color: "#0866FF",
          }}>M</div>

          {/* Amazon a — right floating */}
          <div style={{
            position: "absolute", bottom: 180, right: 10, zIndex: 7,
            background: "#fff", borderRadius: 10,
            width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
            fontSize: 16, fontWeight: 900, color: "#FF9900",
          }}>a</div>

          {/* ── MAIN RESUME DOCUMENT ── */}
          <div style={{
            position: "absolute",
            top: 50, left: 0,
            width: "calc(100% - 100px)",
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 4px 32px rgba(0,0,0,0.09)",
            padding: "18px 22px 60px",
            zIndex: 2,
            overflow: "hidden",
          }}>
            {/* Toolbar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              marginBottom: 16, paddingBottom: 12,
              borderBottom: "1px solid #F0F0EE",
            }}>
              {["B","I","U"].map(t => (
                <button key={t} style={{
                  width: 26, height: 26, border: "none", background: "transparent",
                  fontSize: 12, fontWeight: 700, color: "#777", cursor: "pointer", borderRadius: 4,
                }}>{t}</button>
              ))}
              <span style={{ color: "#DDD", margin: "0 8px" }}>|</span>
              <span style={{ fontSize: 11, color: "#AAA" }}>Selected: Name</span>
            </div>

            {/* Name + title row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 22, fontWeight: 800, color: "#111",
                  border: "1.5px solid #3B82F6",
                  borderRadius: 5, padding: "1px 8px",
                }}>Adoma Eze</span>
                <span style={{ fontSize: 13, color: "#777", fontWeight: 500 }}>UX Engineer</span>
              </div>
            </div>

            {/* Contact row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginBottom: 12, fontSize: 11, color: "#888" }}>
              <span>✉ eze@email.com</span>
              <span>📱 +44 7700 900345</span>
              <span>🌐 adomaeze.design</span>
              <span>⚙ adomaeze.dev</span>
              <span>📝 adoma_codes</span>
            </div>

            {/* Summary */}
            <p style={{
              fontSize: 12, color: "#555", lineHeight: 1.65,
              marginBottom: 16, maxWidth: 560,
              borderLeft: "2px solid #BFDBFE", paddingLeft: 10,
            }}>
              A passionate user experience engineer committed to creating intuitive digital solutions by combining thoughtful design principles with clean, efficient code.
            </p>

            {/* Section header */}
            <p style={{ fontSize: 10, fontWeight: 700, color: "#AAA", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
              Work Experience
            </p>

            {/* Job 1 */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>Senior UX Developer</span>
                <span style={{ fontSize: 10.5, color: "#AAA" }}>Jan 2022 – Feb 2023</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 11, color: "#3B82F6", fontWeight: 600, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6", display: "inline-block" }} />
                  Cyberdyne Systems
                </span>
                <span style={{ color: "#AAA" }}>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 9 }}>📋</span> Contract
                </span>
                <span style={{ color: "#AAA" }}>·</span>
                <span>🌍 Berlin</span>
              </div>
              {[
                "Engineered responsive web applications with React and Node.js.",
                "Conducted A/B testing to optimize user engagement and conversion rates.",
                "Implemented accessibility standards to ensure inclusive design.",
                "Mentored junior developers in UX best practices and coding standards.",
                "Integrated third-party APIs to enhance application functionality.",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
                  <span style={{ color: "#CCC", fontSize: 12, marginTop: 1, flexShrink: 0 }}>·</span>
                  <span style={{ fontSize: 12, color: "#555" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Job 2 — partial, faded */}
            <div style={{ opacity: 0.35, marginTop: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#111" }}>UX Designer</span>
                <span style={{ fontSize: 10, color: "#AAA" }}>Jun 2022 – Feb 2023</span>
              </div>
              <div style={{ fontSize: 11, color: "#888" }}>Full Time · New York</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Helped build components for web applications.</div>
              <div style={{ fontSize: 11, color: "#666" }}>Led teams to deliver high-quality products.</div>
            </div>
          </div>

          {/* ── RESUME SCORE CARD — overlaps top-right of main card ── */}
          <div style={{
            position: "absolute",
            top: 220,
            right: -10,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 36px rgba(0,0,0,0.14)",
            border: "1px solid #EEEEEC",
            padding: "16px 18px",
            width: 180,
            zIndex: 5,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.3 }}>Resume<br />Score</span>
              <span style={{ fontSize: 9.5, color: "#EF4444", fontWeight: 600, textAlign: "right", lineHeight: 1.4 }}>● Action<br />required</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              {/* Circular progress */}
              <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
                <svg style={{ transform: "rotate(-90deg)" }} viewBox="0 0 56 56" width="56" height="56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#E5E7EB" strokeWidth="4.5" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#22C55E" strokeWidth="4.5"
                    strokeDasharray={`${2 * Math.PI * 22 * 0.96} ${2 * Math.PI * 22}`}
                    strokeLinecap="round" />
                </svg>
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#111" }}>
                  96%
                </span>
              </div>
              <button style={{
                background: "#2563EB", color: "#fff",
                fontSize: 11, fontWeight: 700,
                padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                whiteSpace: "nowrap",
              }}>
                + Optimize
              </button>
            </div>
          </div>

          {/* ── AI CHAT BUBBLE — lower left inside card area ── */}
          <div style={{
            position: "absolute",
            bottom: 40,
            left: 20,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 8px 30px rgba(0,0,0,0.11)",
            border: "1px solid #EEEEEC",
            padding: "14px 16px",
            width: 260,
            zIndex: 5,
          }}>
            {/* Question row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#FB923C", flexShrink: 0 }} />
              <img src="https://i.pravatar.cc/30?img=5" alt="" width={24} height={24}
                style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: "#777", fontWeight: 500 }}>Why is my resume weak?</span>
            </div>
            {/* Response bubble */}
            <div style={{
              background: "#F1F1EF",
              borderRadius: "4px 14px 14px 14px",
              padding: "10px 14px",
              marginBottom: 10,
            }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#111", lineHeight: 1.4 }}>
                Your experience was strong. The wording wasn&apos;t. Fixed it.
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: "#2563EB", fontWeight: 600 }}>✦ Ask Resumier AI</p>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY STRIP ── */}
      <section style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 80px 80px",
        display: "flex",
        alignItems: "center",
        gap: 48,
        flexWrap: "wrap",
      }}>
        <p style={{ fontSize: 13, color: "#999", margin: 0, lineHeight: 1.6, flexShrink: 0 }}>
          Trusted by Professionals<br />at top companies
        </p>
        <div style={{ width: 1, height: 36, background: "#DDDDD8", flexShrink: 0 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 36px", alignItems: "center" }}>
          {[
            { label: "Google", weight: 500 },
            { label: "Notion", weight: 700 },
            { label: "zoom", weight: 700 },
            { label: "coinbase", weight: 600 },
            { label: "Dropbox", weight: 600 },
            { label: "Medium", weight: 600 },
          ].map(({ label, weight }) => (
            <span key={label} style={{
              fontSize: 15, fontWeight: weight, color: "#555",
              opacity: 0.5, letterSpacing: "-0.2px",
            }}>{label}</span>
          ))}
        </div>
      </section>

    </main>
  );
}