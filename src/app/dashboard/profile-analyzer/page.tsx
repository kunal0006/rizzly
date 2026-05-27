"use client";

import { useEffect, useState } from "react";
import UploadScreen from "./components/UploadScreen";
import AnalyzingScreen from "./components/AnalyzingScreen";
import ResultsScreen from "./components/ResultsScreen";
import UltraProGate from "./components/UltraProGate";

type Screen = "upload" | "analyzing" | "results";

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

export default function ProfileAnalyzerPage() {
  const [isUltraPro, setIsUltraPro] = useState<boolean | null>(null);
  const [screen, setScreen] = useState<Screen>("upload");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check Ultra Pro status on mount (client-side only)
  useEffect(() => {
    const plan = localStorage.getItem("rizzly_plan");
    setIsUltraPro(plan === "ultra_pro");
  }, []);

  const handleAnalyze = async (
    screenshots: string[],
    photos: string[],
    app: string | null
  ) => {
    setScreen("analyzing");
    setError(null);

    try {
      const res = await fetch("/api/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshots, photos, app }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
      setScreen("results");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      setScreen("upload");
    }
  };

  const handleRedo = () => {
    setResult(null);
    setError(null);
    setScreen("upload");
  };

  // Still checking plan status
  if (isUltraPro === null) {
    return (
      <div
        className="pa-root"
        style={{
          minHeight: "100vh",
          background: "#0d0d14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: "8px",
            color: "#5a5a7a",
          }}
        >
          LOADING...
        </div>
      </div>
    );
  }

  return (
    <div
      className="pa-root"
      style={{
        minHeight: "100vh",
        background: "#0d0d14",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Ultra Pro gate */}
      {!isUltraPro && <UltraProGate />}

      {/* Main content (only shown to Ultra Pro users) */}
      {isUltraPro && (
        <>
          {error && (
            <div
              style={{
                background: "#ff2d7c20",
                border: "1px solid #ff2d7c",
                color: "#ff2d7c",
                fontFamily: "'Press Start 2P', 'Courier New', monospace",
                fontSize: "8px",
                padding: "12px 20px",
                margin: "16px 20px",
                textTransform: "uppercase",
              }}
            >
              ⚠ {error}
            </div>
          )}

          {screen === "upload" && <UploadScreen onAnalyze={handleAnalyze} />}
          {screen === "analyzing" && <AnalyzingScreen />}
          {screen === "results" && result && (
            <ResultsScreen result={result} onRedo={handleRedo} />
          )}
        </>
      )}
    </div>
  );
}
