"use client";

interface SkillGapCardProps {
  gaps: string[];
}

const priorityColor = (i: number) =>
  i === 0 ? ["#f87171", "rgba(248,113,113,0.1)", "rgba(248,113,113,0.25)"] :
  i === 1 ? ["#fbbf24", "rgba(251,191,36,0.1)",  "rgba(251,191,36,0.25)"]  :
             ["#94a3b8", "rgba(148,163,184,0.08)", "rgba(148,163,184,0.2)"];

export default function SkillGapCard({ gaps }: SkillGapCardProps) {
  if (!gaps.length) return (
    <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 14, padding: "16px 20px" }}>
      <p className="text-sm text-green-400 font-medium">✓ No significant skill gaps detected</p>
    </div>
  );

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Missing Skills</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
          {gaps.length} gap{gaps.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-2">
        {gaps.map((gap, i) => {
          const [color, bg, border] = priorityColor(i);
          return (
            <div key={gap} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: bg, border: `1px solid ${border}` }}>
              <span className="text-sm font-medium" style={{ color }}>{gap}</span>
              <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color }}>
                {i === 0 ? "High" : i === 1 ? "Medium" : "Low"}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-white/25 mt-3">Add these to your resume to improve match rate.</p>
    </div>
  );
}