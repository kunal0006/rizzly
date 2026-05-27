"use client";

interface PriorityTagProps {
  priority: "high" | "medium" | string;
}

export default function PriorityTag({ priority }: PriorityTagProps) {
  const isHigh = priority.toLowerCase() === "high";
  return (
    <span
      style={{
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
        fontSize: "6px",
        padding: "3px 7px",
        textTransform: "uppercase",
        background: isHigh ? "#ff2d7c22" : "#ffd60022",
        color: isHigh ? "#ff2d7c" : "#ffd600",
        border: `1px solid ${isHigh ? "#ff2d7c44" : "#ffd60044"}`,
        letterSpacing: "0.05em",
        flexShrink: 0,
      }}
    >
      {isHigh ? "HIGH" : "MEDIUM"}
    </span>
  );
}
