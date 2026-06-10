"use client";
import { useState } from "react";

interface StarSuggestionsCardProps {
  suggestions: string[];
}

export default function StarSuggestionsCard({ suggestions }: StarSuggestionsCardProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  if (!suggestions.length) return null;

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px", marginTop: 16 }}>
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: 14 }}>⭐</span>
        <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">STAR Suggestions</span>
        <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}>
          {suggestions.length} tips
        </span>
      </div>
      <div className="space-y-2">
        {suggestions.slice(0, 5).map((s, i) => (
          <div key={i}>
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-start gap-3 text-left p-3 rounded-xl transition-all duration-150"
              style={{ background: expanded === i ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${expanded === i ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)"}` }}
            >
              <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}>{i + 1}</span>
              <span className="text-sm leading-relaxed" style={{ color: expanded === i ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)" }}>
                {expanded === i ? s : s.slice(0, 72) + (s.length > 72 ? "…" : "")}
              </span>
              <span className="ml-auto text-white/20 text-xs shrink-0 mt-0.5">{expanded === i ? "▲" : "▼"}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}