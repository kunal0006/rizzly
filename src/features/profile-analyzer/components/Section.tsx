"use client";

import { ReactNode } from "react";

interface SectionProps {
  title: string;
  accent: string;
  badge?: string;
  children: ReactNode;
}

export default function Section({ title, accent, badge, children }: SectionProps) {
  return (
    <div
      style={{
        background: "#13131e",
        border: "1px solid #1e1e2e",
        borderLeft: `3px solid ${accent}`,
        marginBottom: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `${accent}18`,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: `1px solid ${accent}30`,
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: "7px",
            color: accent,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </span>
        {badge && (
          <span
            style={{
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              fontSize: "6px",
              background: "#ffd600",
              color: "#000",
              padding: "2px 6px",
              textTransform: "uppercase",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: "16px" }}>{children}</div>
    </div>
  );
}
