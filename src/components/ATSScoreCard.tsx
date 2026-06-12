"use client";
import { useEffect, useState } from "react";

interface ATSScoreCardProps {
  score: number;
}

export default function ATSScoreCard({ score }: ATSScoreCardProps) {
  const [bar, setBar] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBar(score), 150); return () => clearTimeout(t); }, [score]);

  const color = score >= 75 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";
  const label = score >= 80 ? "ATS Friendly" : score >= 65 ? "Needs Work" : "Poor Match";

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">ATS Score</span>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>{label}</span>
      </div>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-4xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{score}</span>
        <span className="text-white/30 text-sm mb-1">/ 100</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: `${bar}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}60`, transition: "width 1.1s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </div>
      <p className="text-xs text-white/35 mt-2">
        {score >= 75 ? "Your resume passes most ATS filters." : score >= 50 ? "Some keywords or formatting may be filtered." : "Resume may be rejected by ATS systems."}
      </p>
    </div>
  );
}