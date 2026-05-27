"use client";

import ScoreRing from "./ScoreRing";

interface MiniScoreProps {
  label: string;
  score: number;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#00ff88";
  if (score >= 50) return "#ffd600";
  return "#ff2d7c";
}

export default function MiniScore({ label, score }: MiniScoreProps) {
  const color = getScoreColor(score);

  return (
    <div
      style={{
        background: "#13131e",
        border: "1px solid #1e1e2e",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: "7px",
          color: "#b0b0cc",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        {label}
      </div>
      <ScoreRing score={score} size={56} strokeWidth={6} showLabel={true} />
      {/* Bar */}
      <div
        style={{
          width: "100%",
          height: "4px",
          background: "#1e1e2e",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${score}%`,
            background: color,
            transition: "width 1s ease-out",
          }}
        />
      </div>
    </div>
  );
}
