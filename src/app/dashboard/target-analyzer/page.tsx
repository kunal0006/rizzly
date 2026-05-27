"use client";

import { useState } from "react";
import TargetUpload from "./components/TargetUpload";
import TargetResults from "./components/TargetResults";
import { Loader2 } from "lucide-react";

type Screen = "upload" | "analyzing" | "results";

const ANALYZING_MESSAGES = [
  "Reading their profile...",
  "Analyzing body language in photos...",
  "Decoding personality cues...",
  "Identifying attachment patterns...",
  "Crafting your approach strategy...",
  "Finding conversation hooks...",
];

export default function TargetAnalyzerPage() {
  const [screen, setScreen] = useState<Screen>("upload");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzingMsg, setAnalyzingMsg] = useState(0);

  const handleAnalyze = async (screenshots: string[]) => {
    setScreen("analyzing");
    setError(null);

    // Cycle through messages
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
    setScreen("upload");
    setAnalyzingMsg(0);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-screen">

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
          <div className="relative">
            <div className="w-24 h-24 bg-secondary text-white brutal-border brutal-shadow-sm flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-pixel uppercase">Decoding Target...</h2>
            <p className="font-bold text-gray-500 uppercase text-sm transition-all">
              {ANALYZING_MESSAGES[analyzingMsg]}
            </p>
          </div>
          {/* Animated dots */}
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
