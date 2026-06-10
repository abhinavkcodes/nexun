import { useState, useEffect } from "react";
import { ReactNode } from "react";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_DATA = {
  fileName: "John_Doe_Resume.pdf",
  jobTitle: "Full Stack Developer",
  resumeStrength: "Good",
  overallScore: 74,
  atsScore: 78,
  roleMatchScore: 75,
  experienceScore: 65,
  projectScore: 72,
  impactScore: 62,
  keywordScore: 68,
  wordCount: 487,
  pageCount: 1,
  recruiterSummary:
    "Good candidate with relevant skills. Strong project work is offset by limited quantification and missing certifications. Address skill gaps before applying broadly.",
  matchedSkills: ["React", "Node.js", "MongoDB", "PostgreSQL", "REST API", "Git", "Express", "TypeScript"],
  skillGaps: ["Next.js", "Docker", "Redis", "GraphQL"],
  keywords: [
    { word: "React", found: true }, { word: "Node.js", found: true },
    { word: "TypeScript", found: true }, { word: "PostgreSQL", found: true },
    { word: "Docker", found: false }, { word: "Kubernetes", found: false },
    { word: "AWS", found: false }, { word: "GraphQL", found: false },
    { word: "REST API", found: true }, { word: "MongoDB", found: true },
    { word: "Git", found: true }, { word: "Next.js", found: false },
    { word: "Redis", found: false }, { word: "Express", found: true },
  ],
  sections: [
    { name: "Skills", status: "good" },
    { name: "Experience", status: "warning" },
    { name: "Projects", status: "good" },
    { name: "Education", status: "good" },
    { name: "Certifications", status: "missing" },
    { name: "Achievements", status: "warning" },
  ],
  suggestions: [
    "Add quantified achievements — e.g. 'Reduced API response time by 40%'",
    "Include Docker and Kubernetes to pass DevOps-aware ATS filters",
    "Add a Certifications section with AWS or Google Cloud credentials",
    "Use stronger action verbs: 'Architected', 'Engineered', 'Optimized'",
    "Link your GitHub profile and deployed project URLs",
    "Add measurable project impact — users, downloads, or performance gains",
  ],
  experienceStrengths: ["Strong action-oriented descriptions", "Demonstrates ownership"],
  experienceWeaknesses: ["Few quantified achievements", "Limited leadership signals"],
  projectStrengths: ["Strong technical depth", "Projects appear deployed"],
  projectWeaknesses: ["Projects lack measurable outcomes"],
  redFlags: ["Several important skills are missing", "No certifications found"],
  // Mock resume text lines for preview
  resumeLines: [
    { type: "name",    text: "John Doe" },
    { type: "contact", text: "john@email.com  •  +1 (555) 123-4567  •  github.com/johndoe" },
    { type: "section", text: "EXPERIENCE" },
    { type: "role",    text: "Software Engineer  —  Acme Corp" },
    { type: "date",    text: "Jan 2023 – Present" },
    { type: "bullet",  text: "Built REST APIs serving 10k+ daily requests using Node.js" },
    { type: "bullet",  text: "Developed React dashboards improving user engagement" },
    { type: "bullet",  text: "Integrated PostgreSQL with optimized query performance" },
    { type: "section", text: "PROJECTS" },
    { type: "role",    text: "E-Commerce Platform" },
    { type: "bullet",  text: "Full-stack app with auth, payments (Stripe), MongoDB" },
    { type: "bullet",  text: "Deployed on Vercel, 200+ active users" },
    { type: "role",    text: "Task Manager API" },
    { type: "bullet",  text: "RESTful API with Express, JWT auth, PostgreSQL" },
    { type: "section", text: "TECHNICAL SKILLS" },
    { type: "skills",  text: "React, Node.js, TypeScript, MongoDB, PostgreSQL, Git, Express, REST API" },
    { type: "section", text: "EDUCATION" },
    { type: "role",    text: "B.Tech Computer Science  —  State University" },
    { type: "date",    text: "2019 – 2023" },
  ],
};

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
function scoreLabel(s: number) {
  if (s >= 80) return "ATS Friendly";
  if (s >= 60) return "Needs Work";
  return "Poor Match";
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
  const size = 180, stroke = 13;
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
        <span style={{ fontSize: 52, fontWeight: 700, color: "#111", lineHeight: 1, letterSpacing: "-3px", fontFamily: "Inter, sans-serif" }}>
          <AnimNum to={score} />
        </span>
        <span style={{ fontSize: 11, color: "#AAA", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginTop: 3 }}>ATS Score</span>
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
      <div style={{ padding: "18px 16px", maxHeight: 420, overflowY: "auto" }}>
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
const STATUS = {
  good:    { label: "Good",    color: "#15803d", bg: "#F0FDF4", border: "#BBF7D0", dot: "#16a34a" },
  warning: { label: "Improve", color: "#d97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#d97706" },
  missing: { label: "Missing", color: "#dc2626", bg: "#FEF2F2", border: "#FECACA", dot: "#dc2626" },
};

interface AnalysisDashboardProps {
  analysisData: any;
}

export default function NexunDashboard({
  analysisData,
}: AnalysisDashboardProps) {
  const [tab, setTab] = useState("overview");
 const d = analysisData ?? MOCK_DATA;
 const safeData = {
  ...MOCK_DATA,
  ...d,
};
console.log("REAL ANALYSIS:", analysisData);
  const kwFound = safeData.keywords.filter(k => k.found).length;

  const TABS = [
    { id: "overview",     label: "Overview" },
    { id: "skills",       label: "Skills" },
    { id: "keywords",     label: "Keywords" },
    { id: "suggestions",  label: "Action Plan" },
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
      <header style={{ background: "#fff", borderBottom: "1px solid #E5E5E3", position: "sticky", top: 0, zIndex: 50, height: 52 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 28px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", display: "flex", alignItems: "center", gap: 7 }}>
              <span>⬡</span> Nexun
            </span>
            <span style={{ width: 1, height: 18, background: "#E5E5E3" }} />
            <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>Resume Analysis</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", background: "#F7F7F6", borderRadius: 7, border: "1px solid #E5E5E3" }}>
              <span style={{ fontSize: 12 }}>📄</span>
              <span style={{ fontSize: 11, color: "#666", fontWeight: 500 }}>{safeData.fileName}</span>
            </div>
            <button style={{ padding: "7px 16px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              ✨ Build ATS Resume
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px 28px 60px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── HERO CARD: Big ATS Score + quick insights ── */}
          <div style={{ background: "#fff", border: "1px solid #E5E5E3", borderRadius: 16, padding: "28px 28px 24px", display: "grid", gridTemplateColumns: "auto 1fr", gap: 32, alignItems: "center" }}>
            {/* Big ring — THE hero element */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <ATSRing score={safeData.atsScore} />
              <span style={{
                fontSize: 13, fontWeight: 700, padding: "5px 18px", borderRadius: 8,
                color: scoreColor(safeData.atsScore), background: scoreBg(safeData.atsScore),
                border: `1px solid ${scoreBorder(safeData.atsScore)}`,
              }}>{scoreLabel(safeData.atsScore)}</span>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Experience", value: safeData.experienceScore, icon: "💼", color: scoreColor(safeData.experienceScore) },
                  { label: "Projects", value: safeData.projectScore, icon: "🛠", color: scoreColor(safeData.projectScore) },
                  { label: "Keywords", value: safeData.keywordScore, icon: "🔍", color: scoreColor(safeData.keywordScore) },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} style={{ background: "#F7F7F6", borderRadius: 10, padding: "12px 13px", border: "1px solid #EBEBEA" }}>
                    <span style={{ fontSize: 14, display: "block", marginBottom: 6 }}>{icon}</span>
                    <span style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 7 }}>{label}</span>
                    <Bar value={value} color={color} delay={300} h={4} />
                    <span style={{ fontSize: 11, color, fontWeight: 600, marginTop: 5, display: "block" }}>
                      {value >= 80 ? "Strong" : value >= 60 ? "Fair" : "Weak"}
                    </span>
                  </div>
                ))}
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

                  {/* Section health */}
                  <div>
                    <p style={{ fontSize: 11, color: "#AAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14 }}>Section Health</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {safeData.sections.map((s, i) => {
                        const sc =
  STATUS[s.status as keyof typeof STATUS];
                        return (
                          <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < safeData.sections.length - 1 ? "1px solid #F0F0EE" : "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, fontWeight: 500, color: "#333" }}>{s.name}</span>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 5, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                              {sc.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ATS compliance checklist */}
                  <div>
                    <p style={{ fontSize: 11, color: "#AAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14 }}>ATS Checklist</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {[
                        { label: "Email address", ok: true },
                        { label: "Phone number", ok: true },
                        { label: "LinkedIn URL", ok: false },
                        { label: "GitHub profile", ok: true },
                        { label: "Skills section", ok: true },
                        { label: "Experience section", ok: true },
                        { label: "Education section", ok: true },
                        { label: "Certifications", ok: false },
                      ].map(({ label, ok }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 8, background: ok ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${ok ? "#BBF7D0" : "#FECACA"}` }}>
                          <span style={{ fontSize: 11, color: ok ? "#16a34a" : "#dc2626", fontWeight: 700 }}>{ok ? "✓" : "✕"}</span>
                          <span style={{ fontSize: 12, color: ok ? "#15803d" : "#b91c1c", fontWeight: 500 }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── SKILLS ── */}
              {tab === "skills" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div>
                    <p style={{ fontSize: 11, color: "#AAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14 }}>
                      Matched Skills <span style={{ color: "#16a34a" }}>({safeData.matchedSkills.length})</span>
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {safeData.matchedSkills.map(s => (
                        <span key={s} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 500, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803d" }}>✓ {s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "#AAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14 }}>
                      Missing Skills <span style={{ color: "#dc2626" }}>({safeData.skillGaps.length})</span>
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {safeData.skillGaps.map((gap, i) => {
                        const conf = [
                          { color: "#dc2626", bg: "#FEF2F2", border: "#FECACA", label: "High priority" },
                          { color: "#d97706", bg: "#FFFBEB", border: "#FDE68A", label: "Medium" },
                          { color: "#6b7280", bg: "#F9FAFB", border: "#E5E7EB", label: "Low" },
                        ][Math.min(i, 2)];
                        return (
                          <div key={gap} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 8, background: conf.bg, border: `1px solid ${conf.border}` }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: conf.color }}>{gap}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: conf.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{conf.label}</span>
                          </div>
                        );
                      })}
                      <p style={{ fontSize: 11, color: "#CCC", marginTop: 2 }}>Add these to boost your ATS match rate.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── KEYWORDS ── */}
              {tab === "keywords" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <p style={{ fontSize: 11, color: "#AAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em" }}>Keyword Coverage</p>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>{kwFound} of {safeData.keywords.length} detected</span>
                  </div>
                  <Bar value={(kwFound / safeData.keywords.length) * 100} color="#2563eb" delay={150} h={5} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 18 }}>
                    {safeData.keywords.map(k => <KwChip key={k.word} {...k} />)}
                  </div>
                  <p style={{ fontSize: 11, color: "#CCC", marginTop: 14 }}>
                    <span style={{ color: "#15803d", fontWeight: 600 }}>● Found</span> — present in resume.&nbsp;&nbsp;
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>○ Missing</span> — add to boost ATS pass rate.
                  </p>
                </div>
              )}

              {/* ── ACTION PLAN ── */}
              {tab === "suggestions" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                    {safeData.suggestions.map((s, i) => {
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
                  <div style={{ padding: "22px 24px", background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4, fontFamily: "'Instrument Serif', serif" }}>Fix all issues automatically</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>Our builder applies every suggestion and exports a clean, recruiter-ready PDF.</p>
                    </div>
                    <button style={{ padding: "10px 20px", background: "#fff", color: "#1e1b4b", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                      ✨ Build ATS Resume
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div style={{ padding: "20px 24px", background: "#fff", border: "1px solid #E5E5E3", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 3 }}>Build an ATS-optimized resume</p>
              <p style={{ fontSize: 12, color: "#888" }}>Auto-apply all suggestions and download a recruiter-ready PDF in minutes.</p>
            </div>
            <button style={{ padding: "10px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              ✨ Build Resume →
            </button>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Resume Preview + Red Flags ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Resume preview */}
          <ResumePreview lines={safeData.resumeLines} highlights={safeData.matchedSkills} />

          {/* Red flags */}
          {safeData.redFlags.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #FECACA", borderRadius: 12, padding: "16px 18px" }}>
              <p style={{ fontSize: 10, color: "#dc2626", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>⚠ Red Flags</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {safeData.redFlags.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 10px", background: "#FEF2F2", borderRadius: 7 }}>
                    <span style={{ color: "#dc2626", fontSize: 10, marginTop: 1 }}>✕</span>
                    <span style={{ fontSize: 12, color: "#991b1b", fontWeight: 500, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          <div style={{ background: "#fff", border: "1px solid #BBF7D0", borderRadius: 12, padding: "16px 18px" }}>
            <p style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>✓ Strengths</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[...safeData.experienceStrengths, ...safeData.projectStrengths].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#16a34a", fontSize: 10, marginTop: 2 }}>●</span>
                  <span style={{ fontSize: 12, color: "#166534", lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}