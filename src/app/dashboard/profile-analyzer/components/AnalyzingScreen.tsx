"use client";

import { useEffect, useRef, useState } from "react";

const MESSAGES = [
  "READING YOUR VIBE...",
  "CHECKING YOUR RIZZ...",
  "RUNNING THE NUMBERS...",
  "COOKING UP FEEDBACK...",
];

export default function AnalyzingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 1300);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "32px",
        padding: "40px 20px",
      }}
    >
      {/* Dino + Spinner */}
      <div style={{ position: "relative", width: "120px", height: "120px" }}>
        {/* SVG ring spinner */}
        <svg
          width="120"
          height="120"
          style={{
            position: "absolute",
            inset: 0,
            animation: "pa-spin 1.2s linear infinite",
          }}
        >
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#1e1e2e"
            strokeWidth="6"
            strokeLinecap="butt"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#00ff88"
            strokeWidth="6"
            strokeLinecap="butt"
            strokeDasharray="327"
            strokeDashoffset="245"
          />
        </svg>
        {/* Dino emoji */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
          }}
        >
          🦕
        </div>
      </div>

      {/* Loading message */}
      <div
        style={{
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: "10px",
          color: "#00ff88",
          textAlign: "center",
          letterSpacing: "0.05em",
          minHeight: "24px",
        }}
      >
        {MESSAGES[msgIdx]}
      </div>

      {/* 5 pixel squares blinking in sequence */}
      <div style={{ display: "flex", gap: "8px" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: "10px",
              height: "10px",
              background: "#00ff88",
              animation: `pa-blink 1s ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pa-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pa-blink {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
