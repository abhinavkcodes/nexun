import { useState, useEffect } from "react";
import { ReactNode } from "react";



// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 80) return "#16a34a";
  if (s >= 60) return "#d97706";
  return "#dc2626";
}
function scoreBg(s: number) {
  if (s >= 80) return "#F0FDF4";
  if (s >= 60) return "#FFFBEB";
  return "#FEF2F2";
}
function scoreBorder(s: number) {
  if (s >= 80) return "#BBF7D0";
  if (s >= 60) return "#FDE68A";
  return "#FECACA";
}
function scoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 50) return "Needs Improvement";
  return "Weak";
}
// ── Animated counter ──────────────────────────────────────────────────────────
function AnimNum({
  to,
  duration = 1200,
}: {
  to: number;
  duration?: number;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
   let start: number | undefined;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, [to, duration]);
  return <>{val}</>;
}

// ── Big ATS ring ──────────────────────────────────────────────────────────────
function ATSRing({ score }: { score: number }) {
  const size = 150, stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setOffset(circ * (1 - score / 100)), 250);
    return () => clearTimeout(t);
  }, [score, circ]);
  const color = scoreColor(score);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Subtle glow behind ring */}
      <div style={{
        position: "absolute", inset: 20, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        filter: "blur(8px)",
      }} />
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "relative", zIndex: 1 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EBEBEA" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: "#111", lineHeight: 1, letterSpacing: "-3px", fontFamily: "Inter, sans-serif" }}>
          <AnimNum to={score} />
        </span>
        <span style={{ fontSize: 11, color: "#AAA", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginTop: 3 }}>Resume Score</span>
      </div>
    </div>
  );
}

// ── Thin progress bar ─────────────────────────────────────────────────────────
function Bar({
  value,
  color,
  delay = 0,
  h = 4,
}: {
  value: number;
  color: string;
  delay?: number;
  h?: number;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div style={{ height: h, background: "#EBEBEA", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 99,
        transition: `width 1s cubic-bezier(0.22,1,0.36,1)` }} />
    </div>
  );
}

// ── Score row (label + bar + pill) ────────────────────────────────────────────
function ScoreRow({
  label,
  value,
  color,
  delay,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
  icon: string;
}) {
  const label_s = value >= 80 ? "Strong" : value >= 60 ? "Fair" : "Weak";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#444", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{icon}</span>{label}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
          color, background: scoreBg(value), border: `1px solid ${scoreBorder(value)}` }}>
          {label_s}
        </span>
      </div>
      <Bar value={value} color={color} delay={delay} h={5} />
    </div>
  );
}

// ── Keyword chip ──────────────────────────────────────────────────────────────
function KwChip({
  word,
  found,
}: {
  word: string;
  found: boolean;
}) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px",
      borderRadius: 6, fontSize: 11, fontWeight: 500,
      background: found ? "#F0FDF4" : "#FEF2F2",
      border: `1px solid ${found ? "#BBF7D0" : "#FECACA"}`,
      color: found ? "#15803d" : "#dc2626",
    }}>
      <span style={{ fontSize: 6 }}>{found ? "●" : "○"}</span>{word}
    </span>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 16px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
      color: active ? "#111" : "#888", background: "transparent",
      borderBottom: `2px solid ${active ? "#111" : "transparent"}`,
      transition: "all 0.15s", whiteSpace: "nowrap",
    }}>{children}</button>
  );
}type ResumeLine = {
  type: string;
  text: string;
};
type KeywordItem = {
  word: string;
  found: boolean;
};

type SectionItem = {
  name: string;
  status: "good" | "warning" | "missing";
  issues?: string[];
  score?: number;
};

type ATSChecklistItem = {
  label: string;
  ok: boolean;
  description?: string;
};

// ── Mini resume preview ───────────────────────────────────────────────────────
function ResumePreview({
  lines,
  highlights,
}: {
  lines: ResumeLine[];
  highlights: string[];
}) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E5E3", borderRadius: 12,
      overflow: "hidden", fontFamily: "Inter, sans-serif",
    }}>
      {/* preview header bar */}
      <div style={{ background: "#F7F7F6", borderBottom: "1px solid #E5E5E3", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57", display: "block" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ffbd2e", display: "block" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840", display: "block" }} />
        </div>
        <span style={{ fontSize: 11, color: "#AAA", marginLeft: 4, fontWeight: 500 }}>Resume Preview</span>
      </div>
      {/* content */}
      <div
  style={{
    padding: "18px 16px",
    maxHeight: "65vh",
    overflowY: "auto",
  }}
>
        {lines.map((line: ResumeLine, i: number) => {
          if (line.type === "name") return (
            <p key={i} style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 2, letterSpacing: "-0.3px" }}>{line.text}</p>
          );
          if (line.type === "contact") return (
            <p key={i} style={{ fontSize: 9, color: "#888", marginBottom: 10, lineHeight: 1.5 }}>{line.text}</p>
          );
          if (line.type === "section") return (
            <div key={i} style={{ marginTop: 14, marginBottom: 5, paddingBottom: 3, borderBottom: "1.5px solid #E5E5E3" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase" }}>{line.text}</span>
            </div>
          );
          if (line.type === "role") return (
            <p key={i} style={{ fontSize: 11, fontWeight: 600, color: "#222", marginBottom: 1, marginTop: 6 }}>{line.text}</p>
          );
          if (line.type === "date") return (
            <p key={i} style={{ fontSize: 9, color: "#AAA", marginBottom: 4 }}>{line.text}</p>
          );
          if (line.type === "bullet") {
            // highlight keywords found in bullet
            const isHighlighted = highlights && highlights.some((kw: string) => line.text.toLowerCase().includes(kw.toLowerCase()));
            return (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3, alignItems: "flex-start" }}>
                <span style={{ color: "#CCC", fontSize: 9, marginTop: 2, flexShrink: 0 }}>•</span>
                <p style={{ fontSize: 10, color: "#555", lineHeight: 1.5,
                  background: isHighlighted ? "#FFF9C4" : "transparent",
                  borderRadius: isHighlighted ? 3 : 0, padding: isHighlighted ? "0 2px" : 0 }}>
                  {line.text}
                </p>
              </div>
            );
          }
          if (line.type === "skills") return (
            <p key={i} style={{ fontSize: 10, color: "#555", lineHeight: 1.7, marginTop: 4 }}>{line.text}</p>
          );
          return null;
        })}
      </div>
    </div>
  );
}

// ── Section status pill ───────────────────────────────────────────────────────


interface AnalysisDashboardProps {
  analysisData: any;
}

export default function NexunDashboard({
  analysisData,
}: AnalysisDashboardProps) {
  const [tab, setTab] = useState("overview");

  const [expandedSection, setExpandedSection] =
    useState<string | null>(null);

  if (!analysisData) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
        }}
      >
        No analysis data available
      </div>
    );
  }

  console.log("REAL ANALYSIS:", analysisData);

  const safeData = analysisData;
console.log("REAL ANALYSIS:", analysisData);
console.log("MATCHED SKILLS:", safeData.matchedSkills);
console.log("RED FLAGS:", safeData.redFlags);
console.log("SECTIONS:", safeData.sections);
console.log("KEYWORDS:", safeData.keywords);
console.log("ATS CHECKLIST:", safeData.atsChecklist);
console.log("REAL ANALYSIS:", analysisData);

// ── Already have ──
console.log("MATCHED SKILLS:", safeData.matchedSkills);
console.log("RED FLAGS:", safeData.redFlags);
console.log("SECTIONS:", safeData.sections);
console.log("KEYWORDS:", safeData.keywords);
console.log("ATS CHECKLIST:", safeData.atsChecklist);




 const kwFound = safeData.keywords.filter(
  (k: KeywordItem) => k.found
).length;

  const TABS = [
    { id: "overview",     label: "Overview" },
    
  ];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#F7F7F6", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadein { from { opacity:0; transform:translateY(6px);} to {opacity:1; transform:translateY(0);} }
        .fade { animation: fadein 0.22s ease; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: #D5D5D3; border-radius: 3px; }
      `}</style>

      {/* ── NAV ── */}
      <header
  style={{
    background: "#fff",
    borderBottom: "1px solid #E5E5E3",
    position: "sticky",
    top: 0,
    zIndex: 50,
    height: 52,
  }}
>
  <div
    style={{
      maxWidth: 1320,
      margin: "0 auto",
      padding: "0 28px",
      height: "100%",
      display: "flex",
      alignItems: "center",
    }}
  >
      <span
        style={{
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        ⬡ Nexun
      </span>
  </div>
</header>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px 28px 60px", display: "grid", gridTemplateColumns: "1fr 350px", gap: 20 }}>

        {/* ── LEFT COLUMN ── */}
        <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 16,

    overflowY: "auto",
    height: "100%",
    paddingRight: 8,
  }}
>

          {/* ── HERO CARD: Big ATS Score + quick insights ── */}
          <div style={{ background: "#fff", border: "1px solid #E5E5E3", borderRadius: 16, padding: "28px 28px 24px", display: "grid", gridTemplateColumns: "auto 1fr", gap: 32, alignItems: "center" }}>
            {/* Big ring — THE hero element */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
             <ATSRing score={safeData.overallScore} />
              <span style={{
                fontSize: 13, fontWeight: 700, padding: "5px 18px", borderRadius: 8,
                color: scoreColor(safeData.overallScore), background: scoreBg(safeData.overallScore),
                border: `1px solid ${scoreBorder(safeData.overallScore)}`,
              }}>{scoreLabel(safeData.overallScore)}</span>
            </div>

            {/* Right side: role, recruiter quote, key signal bars */}
            <div>
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>Detected Role</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#111", letterSpacing: "-0.5px", fontFamily: "'Instrument Serif', Georgia, serif" }}>{safeData.jobTitle}</p>
              </div>

              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 18, fontStyle: "italic", borderLeft: "2px solid #E5E5E3", paddingLeft: 12 }}>
                "{safeData.recruiterSummary}"
              </p>

              {/* 3 signal bars — no number, just qualitative */}
              
  <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  }}
>
  
  {/* Resume Length */}
  <div
    style={{
      background: "#F7F7F6",
      borderRadius: 10,
      padding: "12px 13px",
      border: "1px solid #EBEBEA",
    }}
  >
    <span style={{ fontSize: 18, display: "block", marginBottom: 6 }}>
      📄
    </span>

    <span
      style={{
        fontSize: 11,
        color: "#888",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        display: "block",
        marginBottom: 8,
      }}
    >
      Resume Length
    </span>

    <div
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: "#111",
      }}
    >
      {safeData.pageCount}
    </div>

    <div
      style={{
        fontSize: 12,
        color: "#666",
        marginTop: 4,
      }}
    >
      {safeData.wordCount} words
    </div>

    <span
      style={{
        fontSize: 11,
        color: "#15803d",
        fontWeight: 600,
        marginTop: 8,
        display: "block",
      }}
    >
      ✓ Ideal length
    </span>
  </div>

  {/* Readability */}
 {/* Parse Success */}
<div
  style={{
    background: "#F7F7F6",
    borderRadius: 10,
    padding: "12px 13px",
    border: "1px solid #EBEBEA",
  }}
>
  <span style={{ fontSize: 18, display: "block", marginBottom: 6 }}>
    📑
  </span>

  <span
    style={{
      fontSize: 11,
      color: "#888",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      display: "block",
      marginBottom: 8,
    }}
  >
    Parse Success
  </span>

  <div
    style={{
      fontSize: 18,
      fontWeight: 700,
      color: "#111",
    }}
  >
    {safeData.parseSuccess ?? "--"}%
  </div>

  <div
    style={{
      fontSize: 12,
      color: "#666",
      marginTop: 4,
    }}
  >
    ATS-readable resume
  </div>

  <span
    style={{
      fontSize: 11,
      color:
        (safeData.parseSuccess ?? 0) >= 90
          ? "#15803d"
          : "#d97706",
      fontWeight: 600,
      marginTop: 8,
      display: "block",
    }}
  >
    {(safeData.parseSuccess ?? 0) >= 90
      ? "✓ Successfully parsed"
      : "⚠ Some sections may not be detected"}
  </span>
</div>
</div>
            </div>
          </div>

          {/* ── TABS ── */}
          <div style={{ background: "#fff", border: "1px solid #E5E5E3", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ borderBottom: "1px solid #E5E5E3", display: "flex", padding: "0 8px" }}>
              {TABS.map(t => <TabBtn key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</TabBtn>)}
            </div>
            <div className="fade" key={tab} style={{ padding: "22px" }}>

              {/* ── OVERVIEW ── */}
              {tab === "overview" && (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 24,
    }}
  >
                  <div
  style={{
    background: "#fff",
    border: "1px solid #EBEBEA",
    borderRadius: 12,
    padding: 16,
  }}
>
  {/* Section Health content */}


                  {/* Section health */}
                  <div>
                    <p style={{ fontSize: 11, color: "#AAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14 }}>Section Health</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                     {safeData.sections.map(
  (
    s: SectionItem,
    i: number
  ) => {

    const score = s.score ?? 0;

    const scoreColor =
      score >= 80
        ? "#16a34a"
        : score >= 60
        ? "#d97706"
        : "#dc2626";

    return (
      <div
  key={s.name}
  onClick={() =>
    setExpandedSection(
      expandedSection === s.name
        ? null
        : s.name
    )
  }
  style={{
    cursor: "pointer",
          padding: "12px 0",
          borderBottom:
            i < safeData.sections.length - 1
              ? "1px solid #F0F0EE"
              : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
           marginBottom:
  (s.issues?.length ?? 0) > 0
    ? 8
    : 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <span
  style={{
    color: "#888",
    fontSize: 11,
    width: 12,
  }}
>
  {expandedSection === s.name ? "▼" : "▶"}
</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {s.name}
            </span>
          </div>

          <span
  style={{
    fontSize: 12,
    fontWeight: 700,
    color: scoreColor,
  }}
>
  {score}%
</span>
        </div>

      {expandedSection === s.name &&
 (s.issues?.length ?? 0) > 0 && (
          <div
            style={{
              paddingLeft: 16,
            }}
          >
           {(s.issues ?? []).map(
              (
                issue,
                idx
              ) => (
                <div
                  key={idx}
                  style={{
                    fontSize: 11,
                    color: "#777",
                    lineHeight: 1.6,
                  }}
                >
                  • {issue}
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  }
)}
                    </div>
                  </div>
                  </div>

                  {/* ATS compliance checklist */}
                  <div>
                    {/* ATS compliance checklist */}
<div
  style={{
    background: "#fff",
    border: "1px solid #EBEBEA",
    borderRadius: 12,
    padding: 16,
  }}
>
                    <p style={{ fontSize: 11, color: "#AAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14 }}>MUST HAVE</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {safeData.atsChecklist?.map(
  ({ label, ok }: ATSChecklistItem) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 8, background: ok ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${ok ? "#BBF7D0" : "#FECACA"}` }}>
                          <span style={{ fontSize: 11, color: ok ? "#16a34a" : "#dc2626", fontWeight: 700 }}>{ok ? "✓" : "✕"}</span>
                          <span style={{ fontSize: 12, color: ok ? "#15803d" : "#b91c1c", fontWeight: 500 }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              )}
              <br></br>
{/* Red flags */}

    {safeData.redFlags.length > 0 && (
  <div
    style={{
      background: "#fff",
      border: "1px solid #F3D2D2",
      borderRadius: 12,
      padding: "14px 16px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "#dc2626",
        }}
      >
        ⚠
      </span>

      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#dc2626",
        }}
      >
        Red Flags
      </span>
    </div>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {safeData.redFlags.map((flag: string, i: number) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#FEF7F7",
          }}
        >
          <span
            style={{
              color: "#dc2626",
              fontSize: 11,
              marginTop: 2,
              flexShrink: 0,
            }}
          >
            ●
          </span>

          <span
            style={{
              fontSize: 13,
              color: "#7F1D1D",
              lineHeight: 1.5,
            }}
          >
            {flag}
          </span>
        </div>
      ))}
    </div>
  </div>
)}
 <br></br>

          {/* Strengths */}

         {/* Strengths */}

<div
  style={{
    background: "#fff",
    border: "1px solid #D7F0DD",
    borderRadius: 12,
    padding: "14px 16px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    }}
  >
    <span
      style={{
        fontSize: 12,
        color: "#16a34a",
      }}
    >
      ✓
    </span>

    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#16a34a",
      }}
    >
      Strengths
    </span>
  </div>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
  >
    {[...safeData.experienceStrengths, ...safeData.projectStrengths].map(
      (s, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              color: "#16a34a",
              fontSize: 10,
              marginTop: 3,
            }}
          >
            ●
          </span>

          <span
            style={{
              fontSize: 13,
              color: "#166534",
              lineHeight: 1.5,
            }}
          >
            {s}
          </span>
        </div>
      )
    )}
  </div>
</div>
             

            

              {/* ── ACTION PLAN ── */}
              {tab === "suggestions" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                    {safeData.suggestions.map(
  (s: string, i: number) => {
                      const p = i < 2
                        ? { color: "#dc2626", bg: "#FEF2F2", border: "#FECACA", numBg: "#dc2626", label: "High" }
                        : i < 4
                        ? { color: "#d97706", bg: "#FFFBEB", border: "#FDE68A", numBg: "#d97706", label: "Medium" }
                        : { color: "#6b7280", bg: "#F9FAFB", border: "#E5E7EB", numBg: "#9CA3AF", label: "Low" };
                      return (
                        <div key={i} style={{ display: "flex", gap: 12, padding: "14px", borderRadius: 11, background: "#F7F7F6", border: "1px solid #EBEBEA" }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: p.numBg, color: "#fff", fontSize: 10, fontWeight: 700, marginTop: 1 }}>{i + 1}</div>
                          <div>
                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: p.color, marginBottom: 4, display: "block" }}>{p.label} priority</span>
                            <p style={{ fontSize: 12, color: "#444", lineHeight: 1.6 }}>{s}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* CTA strip */}
                 
                </div>
              )}

            </div>
          </div>

          {/* ── Bottom CTA ── */}
         

        </div>

        {/* ── RIGHT COLUMN: Resume Preview + Red Flags ── */}
       {/* RIGHT COLUMN */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 14,

    position: "sticky",
    top: 72,
    alignSelf: "start",
  }}
>

          {/* Resume preview */}
          <ResumePreview lines={safeData.resumeLines} highlights={safeData.matchedSkills} />

          

{/* PASTE CTA HERE */}
<div
  style={{
    padding: "16px",
    background: "#fff",
    border: "1px solid #E5E5E3",
    borderRadius: 12,
  }}
>
  <p
    style={{
      fontSize: 14,
      fontWeight: 700,
      color: "#111",
      marginBottom: 4,
    }}
  >
    Build an ATS-optimized resume
  </p>

  <p
    style={{
      fontSize: 12,
      color: "#888",
      marginBottom: 12,
      lineHeight: 1.5,
    }}
  >
    Auto-apply all suggestions and generate a recruiter-ready resume.
  </p>

  <button
    style={{
      width: "100%",
      padding: "10px",
      background: "#111",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    ✨ Build Resume →
  </button>
</div>

</div> {/* RIGHT COLUMN */}
      </div>
    </div>
  );
}