"use client";

import { useState, useEffect } from "react";
import PromptOnboarding from "./components/PromptOnboarding";
import PromptResults from "./components/PromptResults";
import FreeTrialGate from "@/components/FreeTrialGate";
import { getUserPlan, consumeFreeUse } from "@/lib/plan-utils";
import { Loader2 } from "lucide-react";

type Screen = "loading" | "gate" | "onboarding" | "generating" | "results";

export default function PromptsPage() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isRemixing, setIsRemixing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freeUses, setFreeUses] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    async function checkPlan() {
      const plan = await getUserPlan();
      const paid = plan.plan === "pro" || plan.plan === "ultra_pro";
      setIsPaid(paid);
      setFreeUses(plan.freeUsesRemaining);

      if (paid) {
        setScreen("onboarding");
      } else {
        setScreen("gate");
      }
    }
    checkPlan();
  }, []);

  const handleUnlockFree = () => {
    setScreen("onboarding");
  };

  const generatePrompts = async (data: any, isRemix = false) => {
    if (isRemix) {
      setIsRemixing(true);
    } else {
      setScreen("generating");
      setOnboardingData(data);
    }
    setError(null);

    try {
      const res = await fetch("/api/generate-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tone: isRemix ? "Alternative options, be more unhinged" : data.vibe }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Generation failed");

      if (!isRemix && !isPaid) {
        const consumed = await consumeFreeUse();
        if (!consumed) {
          setFreeUses(0);
          setScreen("gate");
          return;
        }
        setFreeUses((prev) => Math.max(0, prev - 1));
      }

      setPrompts(result.prompts);
      setScreen("results");
    } catch (err: any) {
      setError(err.message || "Failed to generate prompts");
      if (!isRemix) setScreen("onboarding");
    } finally {
      setIsRemixing(false);
    }
  };

  const handleRemix = () => {
    if (onboardingData) {
      generatePrompts(onboardingData, true);
    }
  };

  if (screen === "loading") {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 min-h-screen">

      {screen === "gate" && (
        <div className="space-y-8">
          <header className="border-b-4 border-black pb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-pixel uppercase tracking-tight">Prompt Generator</h1>
            <p className="font-bold text-xl uppercase mt-3">Stop writing boring bios. Let the AI cook.</p>
          </header>
          <FreeTrialGate
            featureName="Prompt Generator"
            usesRemaining={freeUses}
            onContinue={handleUnlockFree}
          />
        </div>
      )}
      
      {screen === "onboarding" && (
        <div className="space-y-10">
          <header className="space-y-4 border-b-4 border-black pb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-pixel uppercase tracking-tight">Prompt Generator</h1>
            <p className="font-bold text-xl uppercase">Stop writing boring bios. Let the AI cook.</p>
          </header>
          
          {error && (
            <div className="bg-secondary text-white p-4 brutal-border font-bold uppercase text-center">
              ⚠️ {error}
            </div>
          )}

          <PromptOnboarding onComplete={generatePrompts} />
        </div>
      )}

      {screen === "generating" && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 bg-primary brutal-border brutal-shadow-sm flex items-center justify-center animate-pulse">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-pixel uppercase">Cooking Prompts...</h2>
            <p className="font-bold text-gray-500 uppercase">Analyzing your chaotic energy.</p>
          </div>
        </div>
      )}

      {screen === "results" && (
        <PromptResults 
          prompts={prompts} 
          onRemix={handleRemix}
          isRemixing={isRemixing}
        />
      )}
    </div>
  );
}
