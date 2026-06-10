"use client";
import { useEffect, useState } from "react";

interface ExperienceScoreCardProps {
  score: number;
  roleTitle?: string;
}

export default function ExperienceScoreCard({ score, roleTitle = "the target role" }: ExperienceScoreCardProps) {
  const [bar, setBar] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBar(score), 200); return () => clearTimeout(t); }, [score]);

  const color = score >= 80 ? "#60a5fa" : score >= 60 ? "#fbbf24" : "#f87171";
  const tiers = ["Entry", "Junior", "Mid", "Senior", "Expert"];
  const tierIndex = Math.min(Math.floor(score / 20), 4);

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Experience Match</span>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>{tiers[tierIndex]}</span>
      </div>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-4xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{score}</span>
        <span className="text-white/30 text-sm mb-1">/ 100</span>
      </div>
      {/* Tier steps */}
      <div className="flex gap-1 mb-3">
        {tiers.map((t, i) => (
          <div key={t} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-1 rounded-full" style={{ backgroundColor: i <= tierIndex ? color : "rgba(255,255,255,0.08)", transition: "background-color 0.8s ease" }} />
            <span className="text-[9px] text-white/25">{t}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/35">
        {score >= 80 ? `Strong alignment with ${roleTitle}.` : score >= 60 ? `Moderate match with ${roleTitle}.` : `Limited alignment with ${roleTitle}.`}
      </p>
    </div>
  );
}