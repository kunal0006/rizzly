"use client";

import { useState, useEffect } from "react";
import { TargetUpload, TargetResults } from "@/features/target-analyzer";
import FreeTrialGate from "@/components/common/FreeTrialGate";
import { getUserPlan, consumeFreeUse } from "@/lib/plan-utils";
import { Loader2 } from "lucide-react";

type Screen = "loading" | "gate" | "upload" | "analyzing" | "results";

const ANALYZING_MESSAGES = [
  "Reading their profile...",
  "Analyzing body language in photos...",
  "Decoding personality cues...",
  "Identifying attachment patterns...",
  "Crafting your approach strategy...",
  "Finding conversation hooks...",
];

export default function TargetAnalyzerPage() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzingMsg, setAnalyzingMsg] = useState(0);
  const [freeUses, setFreeUses] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    async function checkPlan() {
      const plan = await getUserPlan();
      const paid = plan.plan === "pro" || plan.plan === "ultra_pro";
      setIsPaid(paid);
      setFreeUses(plan.freeUsesRemaining);

      if (paid) {
        setScreen("upload");
      } else {
        setScreen("gate");
      }
    }
    checkPlan();
  }, []);

  const handleUnlockFree = async () => {
    setScreen("upload");
  };

  const handleAnalyze = async (screenshots: string[]) => {
    setError(null);

    // Consume a free use BEFORE making the expensive API call
    if (!isPaid) {
      const consumed = await consumeFreeUse();
      if (!consumed) {
        setFreeUses(0);
        setScreen("gate");
        return;
      }
      setFreeUses((prev) => Math.max(0, prev - 1));
    }

    setScreen("analyzing");

    const interval = setInterval(() => {
      setAnalyzingMsg((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
    }, 2000);

    try {
      const res = await fetch("/api/analyze-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshots }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setResult(data);
      setScreen("results");
    } catch (err: any) {
      setError(err.message || "Analysis failed");
      setScreen("upload");
    } finally {
      clearInterval(interval);
    }
  };

  const handleRedo = () => {
    setResult(null);
    setError(null);
    if (isPaid) {
      setScreen("upload");
    } else {
      setScreen("gate");
    }
    setAnalyzingMsg(0);
  };

  if (screen === "loading") {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-screen space-y-8">

      {screen === "gate" && (
        <div className="space-y-8">
          <div className="border-b-4 border-black pb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-pixel uppercase tracking-tight">Target Analyzer</h1>
            <p className="font-bold text-gray-500 uppercase mt-3 text-sm">
              Upload their profile screenshots. We'll decode their psychology.
            </p>
          </div>
          <FreeTrialGate
            featureName="Target Analyzer"
            usesRemaining={freeUses}
            onContinue={handleUnlockFree}
          />
        </div>
      )}

      {screen === "upload" && (
        <div className="space-y-6">
          {error && (
            <div className="bg-secondary text-white p-4 brutal-border font-bold uppercase text-center">
              ⚠️ {error}
            </div>
          )}
          <TargetUpload onAnalyze={handleAnalyze} />
        </div>
      )}

      {screen === "analyzing" && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
          <div className="w-24 h-24 bg-secondary text-white brutal-border brutal-shadow-sm flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-pixel uppercase">Decoding Target...</h2>
            <p className="font-bold text-gray-500 uppercase text-sm">
              {ANALYZING_MESSAGES[analyzingMsg]}
            </p>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-secondary brutal-border"
                style={{
                  animation: "pulse 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {screen === "results" && result && (
        <TargetResults result={result} onRedo={handleRedo} />
      )}
    </div>
  );
}
