"use client";

import Link from "next/link";

export default function UltraProGate() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "40px 20px",
      }}
    >
      {/* Blurred teaser background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          filter: "blur(6px) brightness(0.3)",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          padding: "40px 20px",
          gap: "16px",
          overflow: "hidden",
        }}
      >
        {/* Fake preview elements */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              height: "60px",
              background: "#13131e",
              borderLeft: `3px solid ${
                ["#00ff88", "#ff2d7c", "#ffd600", "#a855f7", "#38bdf8"][i]
              }`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Gate card */}
      <div
        id="ultra-pro-gate"
        style={{
          position: "relative",
          zIndex: 10,
          background: "#13131e",
          border: "2px solid #ffd600",
          padding: "36px 32px",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 0 40px #ffd60020",
        }}
      >
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>🔒</div>
        <div
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: "10px",
            color: "#ffd600",
            marginBottom: "20px",
            textTransform: "uppercase",
            lineHeight: 1.8,
          }}
        >
          ULTRA PRO EXCLUSIVE
        </div>
        <p
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "14px",
            color: "#b0b0cc",
            lineHeight: 1.7,
            marginBottom: "28px",
          }}
        >
          Analyze your full dating profile — bio, photos, prompts — and get a
          personalized game plan to maximize your match rate.
        </p>
        <Link
          href="/pricing"
          id="upgrade-cta-btn"
          style={{
            display: "block",
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: "9px",
            background: "#ffd600",
            color: "#000",
            padding: "16px",
            textDecoration: "none",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            boxShadow: "4px 4px 0px #a89000",
          }}
        >
          UPGRADE TO ULTRA PRO
        </Link>
        <div
          style={{
            marginTop: "16px",
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: "6px",
            color: "#5a5a7a",
          }}
        >
          INCLUDED IN GRIZZLY+ PLAN
        </div>
      </div>
    </div>
  );
}
