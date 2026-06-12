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
function AnimNum({ to, duration = 1200 }: { to: number; duration?: number }) {
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

// ── ATS ring ──────────────────────────────────────────────────────────────────
function ATSRing({ score }: { score: number }) {
  const size = 140, stroke = 8;
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
      <div style={{
        position: "absolute", inset: 20, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        filter: "blur(8px)",
      }} />
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "relative", zIndex: 1 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EBEBEA" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <span style={{ fontSize: 38, fontWeight: 700, color: "#111", lineHeight: 1, letterSpacing: "-3px" }}>
          <AnimNum to={score} />
        </span>
        <span style={{ fontSize: 10, color: "#AAA", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginTop: 4 }}>
          Resume Score
        </span>
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function Bar({ value, color, delay = 0, h = 5 }: { value: number; color: string; delay?: number; h?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div style={{ height: h, background: "#EBEBEA", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 99, transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }} />
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type ResumeLine = { type: string; text: string };
type KeywordItem = { word: string; found: boolean };
type SectionItem = { name: string; status: "good" | "warning" | "missing"; issues?: string[]; score?: number };
type ATSChecklistItem = { label: string; ok: boolean; description?: string };

// ── Resume Preview ────────────────────────────────────────────────────────────
function ResumePreview({ lines, highlights }: { lines: ResumeLine[]; highlights: string[] }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E5E3", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ background: "#F7F7F6", borderBottom: "1px solid #E5E5E3", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57", display: "block" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ffbd2e", display: "block" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840", display: "block" }} />
        </div>
        <span style={{ fontSize: 12, color: "#666", marginLeft: 4, fontWeight: 500 }}>Resume Preview</span>
      </div>
      <div style={{ padding: "18px 16px", maxHeight: "62vh", overflowY: "auto" }}>
        {lines.map((line: ResumeLine, i: number) => {
          if (line.type === "name") return (
            <p key={i} style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 2, letterSpacing: "-0.3px" }}>{line.text}</p>
          );
          if (line.type === "contact") return (
            <p key={i} style={{ fontSize: 9, color: "#888", marginBottom: 10, lineHeight: 1.6 }}>{line.text}</p>
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
            const isHighlighted = highlights?.some((kw: string) => line.text.toLowerCase().includes(kw.toLowerCase()));
            return (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 3, alignItems: "flex-start" }}>
                <span style={{ color: "#CCC", fontSize: 9, marginTop: 2, flexShrink: 0 }}>•</span>
                <p style={{ fontSize: 10, color: "#555", lineHeight: 1.5, background: isHighlighted ? "#FFF9C4" : "transparent", borderRadius: isHighlighted ? 3 : 0, padding: isHighlighted ? "0 2px" : 0 }}>
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

// ── Label pill ────────────────────────────────────────────────────────────────
function SectionLabel({ score }: { score: number }) {
  const color = scoreColor(score);
  const bg = scoreBg(score);
  const border = scoreBorder(score);
  const text = score >= 80 ? "Strong" : score >= 60 ? "Fair" : "Weak";
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 5, color, background: bg, border: `1px solid ${border}`, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
interface AnalysisDashboardProps { analysisData: any }

export default function NexunDashboard({ analysisData }: AnalysisDashboardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!analysisData) return (
    <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 14 }}>
      No analysis data available
    </div>
  );

  const safeData = analysisData;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#F7F7F6", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadein { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        .fade { animation: fadein 0.2s ease; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #D5D5D3; border-radius: 3px; }
        .section-row { transition: background 0.12s; }
        .section-row:hover { background: #FAFAFA; }
      `}</style>

      {/* ── NAV ── */}
      <header style={{ background: "#fff", borderBottom: "1px solid #E5E5E3", position: "sticky", top: 0, zIndex: 50, height: 54 }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 28px", height: "100%", display: "flex", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>⬡ Nexun</span>
        </div>
      </header>

      {/* ── LAYOUT ── */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px 28px 60px", display: "grid", gridTemplateColumns: "1fr 350px", gap: 20, alignItems: "start" }}>

        {/* ══ LEFT ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Score card */}
          <div style={{ background: "#fff", border: "1px solid #E5E5E3", borderRadius: 16, padding: "24px 28px", display: "grid", gridTemplateColumns: "160px 1fr", gap: 28, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <ATSRing score={safeData.overallScore} />
              <span style={{ fontSize: 13, fontWeight: 700, padding: "5px 18px", borderRadius: 8, color: scoreColor(safeData.overallScore), background: scoreBg(safeData.overallScore), border: `1px solid ${scoreBorder(safeData.overallScore)}` }}>
                {scoreLabel(safeData.overallScore)}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p style={{ fontSize: 11, color: "#AAA", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>Detected Role</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#111", letterSpacing: "-0.4px" }}>{safeData.jobTitle}</p>
              </div>

              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.65, fontStyle: "italic", borderLeft: "2px solid #E5E5E3", paddingLeft: 12 }}>
                "{safeData.recruiterSummary}"
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Resume Length */}
                <div style={{ background: "#F7F7F6", borderRadius: 10, padding: "12px 14px", border: "1px solid #EBEBEA" }}>
                  <p style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Resume Length</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 2 }}>{safeData.wordCount}</p>
                  <p style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>words</p>
                  <p style={{ fontSize: 11, color: "#15803d", fontWeight: 600 }}>Ideal length</p>
                </div>

                {/* Parse Success */}
                <div style={{ background: "#F7F7F6", borderRadius: 10, padding: "12px 14px", border: "1px solid #EBEBEA" }}>
                  <p style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Parse Success</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 2 }}>{safeData.parseSuccess ?? "--"}%</p>
                  <p style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>ATS-readable resume</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: (safeData.parseSuccess ?? 0) >= 90 ? "#15803d" : "#d97706" }}>
                    {(safeData.parseSuccess ?? 0) >= 90 ? "Successfully parsed" : "Some sections may not be detected"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Analysis */}
          <div style={{ background: "#fff", border: "1px solid #E5E5E3", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E5E5E3" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Section Analysis</p>
            </div>

            {safeData.sections.map((s: SectionItem, i: number) => {
              const score = s.score ?? 0;
              const color = scoreColor(score);
              const isLast = i === safeData.sections.length - 1;
              const isExpanded = expandedSection === s.name;

              return (
                <div key={s.name}>
                  <div
  className="section-row"
  onClick={() => setExpandedSection(isExpanded ? null : s.name)}
  style={{
    display: "grid",
    gridTemplateColumns: "16px 1fr 70px 100px",
gap: 16,
    alignItems: "center",
   
    padding: "14px 24px",
    cursor: "pointer",
    borderBottom: !isLast || isExpanded ? "1px solid #F5F5F3" : "none",
  }}
>
  <span style={{ fontSize: 9, color: "#AAA" }}>{isExpanded ? "▼" : "▶"}</span>
  <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{s.name}</span>

  {/* Score as X/100 only, no label, no % */}
  <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 48, textAlign: "right" }}>
    {score}/100
  </span>

  <Bar value={score} color={color} delay={i * 80} />
</div>
                  {isExpanded && (s.issues?.length ?? 0) > 0 && (
                    <div style={{
                      padding: "10px 24px 14px 54px",
                      background: "#FAFAFA",
                      borderBottom: isLast ? "none" : "1px solid #F5F5F3",
                      display: "flex", flexDirection: "column", gap: 5,
                    }}>
                      {(s.issues ?? []).map((issue, idx) => (
                        <div key={idx} style={{ fontSize: 12, color: "#666", lineHeight: 1.6, display: "flex", gap: 8 }}>
                          <span style={{ color: "#d97706", flexShrink: 0 }}>•</span>
                          {issue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Must Have + Red Flags + Strengths */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Must Have */}
            <div style={{ background: "#fff", border: "1px solid #E5E5E3", borderRadius: 16, padding: "20px 22px" }}>
              <p style={{ fontSize: 11, color: "#AAA", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14 }}>Must Have</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {safeData.atsChecklist?.map(({ label, ok }: ATSChecklistItem) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: ok ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${ok ? "#BBF7D0" : "#FECACA"}` }}>
                    <span style={{ fontSize: 11, color: ok ? "#16a34a" : "#dc2626", fontWeight: 700, flexShrink: 0 }}>{ok ? "✓" : "✕"}</span>
                    <span style={{ fontSize: 12, color: ok ? "#15803d" : "#b91c1c", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Strengths */}
              <div style={{ background: "#fff", border: "1px solid #D7F0DD", borderRadius: 16, padding: "20px 22px", flex: 1 }}>
                <p style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14 }}>Strengths</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...safeData.experienceStrengths, ...safeData.projectStrengths].map((s: string, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <span style={{ color: "#16a34a", fontSize: 9, marginTop: 4, flexShrink: 0 }}>●</span>
                      <span style={{ fontSize: 13, color: "#166534", lineHeight: 1.55 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags */}
              {safeData.redFlags?.length > 0 && (
                <div style={{ background: "#fff", border: "1px solid #F3D2D2", borderRadius: 16, padding: "20px 22px" }}>
                  <p style={{ fontSize: 11, color: "#dc2626", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14 }}>Red Flags</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {safeData.redFlags.map((flag: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                        <span style={{ color: "#dc2626", fontSize: 9, marginTop: 4, flexShrink: 0 }}>●</span>
                        <span style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.55 }}>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ══ RIGHT ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 70, alignSelf: "start" }}>

          <ResumePreview lines={safeData.resumeLines} highlights={safeData.matchedSkills} />

          <div style={{ background: "#fff", border: "1px solid #E5E5E3", borderRadius: 16, padding: "20px 22px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 5 }}>Build an ATS-optimized resume</p>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 16, lineHeight: 1.55 }}>
              Auto-apply all suggestions and generate a recruiter-ready resume optimized for ATS systems.
            </p>
            <button style={{ width: "100%", padding: "11px", background: "#111", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Build Resume →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
