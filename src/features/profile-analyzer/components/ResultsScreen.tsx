"use client";

import { useState } from "react";
import ScoreRing from "./ScoreRing";
import MiniScore from "./MiniScore";
import Section from "./Section";
import PriorityTag from "./PriorityTag";

interface AnalysisResult {
  app: string;
  score: number;
  grade: string;
  summary: string;
  bio: { score: number; feedback: string; rewrite: string };
  photos: { score: number; feedback: string; tips: string[] };
  prompts: { score: number; feedback: string; rewrite: string };
  actions: { priority: string; action: string; impact: string }[];
  appTips: string[];
}

interface ResultsScreenProps {
  result: AnalysisResult;
  onRedo: () => void;
}

const APP_EMOJIS: Record<string, string> = {
  Tinder: "🔥",
  Hinge: "💜",
  Bumble: "🐝",
  Unknown: "💫",
};

function getScoreColor(score: number): string {
  if (score >= 75) return "#00ff88";
  if (score >= 50) return "#ffd600";
  return "#ff2d7c";
}

const bodyText: React.CSSProperties = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: "14px",
  color: "#b0b0cc",
  lineHeight: 1.7,
  margin: 0,
};

export default function ResultsScreen({ result, onRedo }: ResultsScreenProps) {
  const [bioOpen, setBioOpen] = useState(false);
  const appEmoji = APP_EMOJIS[result.app] ?? "💫";
  const gradeColor = getScoreColor(result.score);

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #1e1e2e",
          background: "#13131e",
          position: "sticky",
          top: 0,
          zIndex: 10,
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              fontSize: "10px",
              color: "#00ff88",
              marginBottom: "4px",
            }}
          >
            🦕 PROFILE ANALYSIS
          </div>
          <div
            style={{
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              fontSize: "7px",
              color: "#5a5a7a",
              textTransform: "uppercase",
            }}
          >
            DETECTED: {result.app.toUpperCase()} {appEmoji}
          </div>
        </div>
        <button
          onClick={onRedo}
          id="redo-btn"
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: "8px",
            background: "transparent",
            color: "#b0b0cc",
            border: "1px solid #1e1e2e",
            padding: "8px 14px",
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          ↩ REDO
        </button>
      </div>

      <div style={{ padding: "20px", maxWidth: "680px", margin: "0 auto" }}>
        {/* Section 1 — Overall Score */}
        <div
          style={{
            background: "#13131e",
            border: "1px solid #1e1e2e",
            borderLeft: "3px solid #00ff88",
            padding: "24px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <ScoreRing score={result.score} size={88} strokeWidth={8} />
          <div style={{ flex: 1, minWidth: "140px" }}>
            <div
              style={{
                fontFamily: "'Press Start 2P', 'Courier New', monospace",
                fontSize: "40px",
                color: gradeColor,
                lineHeight: 1,
                marginBottom: "12px",
              }}
            >
              {result.grade}
            </div>
            <p style={{ ...bodyText, color: "#ffffff", fontSize: "15px" }}>
              {result.summary}
            </p>
          </div>
        </div>

        {/* Section 2 — Score Breakdown */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <MiniScore label="BIO" score={result.bio.score} />
          <MiniScore label="PHOTOS" score={result.photos.score} />
          <MiniScore label="PROMPTS" score={result.prompts.score} />
        </div>

        {/* Section 3 — Bio */}
        <Section title="BIO ANALYSIS" accent="#00ff88">
          <p style={bodyText}>{result.bio.feedback}</p>
          <button
            onClick={() => setBioOpen((v) => !v)}
            id="bio-rewrite-toggle"
            style={{
              marginTop: "14px",
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              fontSize: "7px",
              background: "transparent",
              color: "#00ff88",
              border: "1px solid #00ff8844",
              padding: "8px 12px",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {bioOpen ? "▾" : "▸"} SUGGESTED REWRITE
          </button>
          {bioOpen && (
            <div
              style={{
                marginTop: "10px",
                background: "#00ff8812",
                border: "1px solid #00ff8830",
                padding: "14px",
              }}
            >
              <p
                style={{
                  ...bodyText,
                  color: "#00ff88",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                {result.bio.rewrite}
              </p>
            </div>
          )}
        </Section>

        {/* Section 4 — Photos */}
        <Section title="PHOTO ANALYSIS" accent="#ff2d7c" badge="ULTRA PRO">
          <p style={bodyText}>{result.photos?.feedback}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0" }}>
            {result.photos?.tips?.map((tip, i) => (
              <li
                key={i}
                style={{
                  ...bodyText,
                  display: "flex",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#ff2d7c", flexShrink: 0 }}>▸</span>
                {tip}
              </li>
            ))}
          </ul>
        </Section>

        {/* Section 5 — Prompts */}
        <Section title="PROMPTS & ANSWERS" accent="#ffd600">
          <p style={bodyText}>{result.prompts.feedback}</p>
          {result.prompts.rewrite && (
            <div
              style={{
                marginTop: "14px",
                background: "#ffd60012",
                border: "1px solid #ffd60030",
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontFamily: "'Press Start 2P', 'Courier New', monospace",
                  fontSize: "7px",
                  color: "#ffd600",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                IMPROVED PROMPT
              </div>
              <p
                style={{
                  ...bodyText,
                  color: "#ffd600",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                {result.prompts.rewrite}
              </p>
            </div>
          )}
        </Section>

        {/* Section 6 — Game Plan */}
        <Section title="YOUR GAME PLAN" accent="#a855f7">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {result.actions?.map((action, i) => (
              <div
                key={i}
                style={{
                  background: "#a855f710",
                  border: "1px solid #a855f730",
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <PriorityTag priority={action.priority} />
                  <p
                    style={{
                      ...bodyText,
                      color: "#ffffff",
                      margin: 0,
                      fontSize: "14px",
                    }}
                  >
                    {action.action}
                  </p>
                </div>
                <p
                  style={{
                    ...bodyText,
                    color: "#5a5a7a",
                    margin: 0,
                    fontSize: "13px",
                  }}
                >
                  → {action.impact}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 7 — App Secrets */}
        <Section title={`${result.app?.toUpperCase() || "APP"} SECRETS`} accent="#38bdf8">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {result.appTips?.map((tip, i) => (
              <div
                key={i}
                style={{
                  background: "#38bdf810",
                  border: "1px solid #38bdf830",
                  padding: "14px",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <span style={{ color: "#38bdf8", flexShrink: 0 }}>
                  {i + 1}.
                </span>
                <p style={{ ...bodyText, margin: 0 }}>{tip}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
