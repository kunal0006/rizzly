"use client";

import { useState } from "react";
import PromptOnboarding from "./components/PromptOnboarding";
import PromptResults from "./components/PromptResults";
import { Loader2 } from "lucide-react";

type Screen = "onboarding" | "generating" | "results";

export default function PromptsPage() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isRemixing, setIsRemixing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // If remixing, we could ask the user for a new tone, or just pass a generic 'Remix' flag.
        // For now, we'll just resend the same data and tell the AI to give alternative options.
        body: JSON.stringify({ ...data, tone: isRemix ? "Alternative options, be more unhinged" : data.vibe }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Generation failed");

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

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 min-h-screen">
      
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
