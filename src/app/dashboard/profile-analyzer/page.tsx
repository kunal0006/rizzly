"use client";

import { useEffect, useState } from "react";
import UploadScreen from "./components/UploadScreen";
import AnalyzingScreen from "./components/AnalyzingScreen";
import ResultsScreen from "./components/ResultsScreen";
import UltraProGate from "./components/UltraProGate";
import { getUserPlan, consumeFreeUse } from "@/lib/plan-utils";
import { Loader2 } from "lucide-react";

type Screen = "loading" | "gate" | "upload" | "analyzing" | "results";

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
  const [screen, setScreen] = useState<Screen>("loading");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [freeUses, setFreeUses] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkPlan() {
      const plan = await getUserPlan();
      // Profile analyzer is an ultra_pro feature for unlimited uses
      const isUltraPro = plan.plan === "ultra_pro";
      setHasAccess(isUltraPro);
      setFreeUses(plan.freeUsesRemaining);

      if (isUltraPro) {
        setScreen("upload");
      } else {
        setScreen("gate");
      }
    }
    checkPlan();
  }, []);

  const handleUnlockFree = () => {
    setScreen("upload");
  };

  const handleAnalyze = async (
    screenshots: string[],
    photos: string[],
    app: string | null
  ) => {
    if (!hasAccess) {
      const consumed = await consumeFreeUse("profile-analyzer");
      if (!consumed) {
        setFreeUses(0);
        setScreen("gate");
        return;
      }
      setFreeUses((prev) => Math.max(0, prev - 1));
    }

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
    if (hasAccess) {
      setScreen("upload");
    } else {
      setScreen("gate");
    }
  };

  if (screen === "loading") {
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
      {screen === "gate" && (
        <>
          {freeUses > 0 ? (
            <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", marginTop: "40px" }}>
              <div
                style={{
                  background: "#13131e",
                  border: "2px solid #ffd600",
                  padding: "40px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "24px",
                  textAlign: "center",
                  boxShadow: "0 0 40px #ffd60020",
                }}
              >
                <div style={{ background: "#ffd600", color: "#000", padding: "6px 12px", fontFamily: "'Press Start 2P'", fontSize: "12px", textTransform: "uppercase" }}>
                  FREE TRIAL
                </div>
                <p style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "16px", color: "#b0b0cc" }}>
                  You have <span style={{ color: "#ffd600", fontFamily: "'Press Start 2P'", fontSize: "14px" }}>{freeUses}</span> free Profile Analyzer use{freeUses > 1 ? "s" : ""} remaining
                </p>
                <button
                  onClick={handleUnlockFree}
                  style={{
                    background: "#ffd600",
                    color: "#000",
                    padding: "16px 32px",
                    fontFamily: "'Press Start 2P'",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "4px 4px 0px #a89000",
                    marginTop: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Use Free Trial
                </button>
              </div>
            </div>
          ) : (
            <UltraProGate />
          )}
        </>
      )}

      {(screen === "upload" || screen === "analyzing" || screen === "results") && (
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
