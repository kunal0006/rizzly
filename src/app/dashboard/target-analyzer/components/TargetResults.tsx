"use client";

import { Copy, MessageCircle, Shield, AlertTriangle, Heart, Zap, Brain, Target } from "lucide-react";
import { useState } from "react";

interface TargetAnalysis {
  targetName: string;
  age: string | null;
  app: string;
  personalityBreakdown: {
    type: string;
    traits: string[];
    summary: string;
  };
  attachmentStyle: {
    style: string;
    confidence: number;
    explanation: string;
  };
  vibeCheck: {
    overallVibe: string;
    energyLevel: number;
    opennessToConnection: number;
    humorStyle: string;
  };
  greenFlags: string[];
  redFlags: string[];
  interests: string[];
  conversationHooks: { hook: string; why: string }[];
  approachStrategy: {
    doThis: string[];
    avoidThis: string[];
    bestOpeningLine: string;
    toneThatWorks: string;
  };
  compatibilityNotes: string;
}

interface TargetResultsProps {
  result: TargetAnalysis;
  onRedo: () => void;
}

export default function TargetResults({ result, onRedo }: TargetResultsProps) {
  const [copiedOpener, setCopiedOpener] = useState(false);

  const handleCopyOpener = () => {
    navigator.clipboard.writeText(result.approachStrategy.bestOpeningLine);
    setCopiedOpener(true);
    setTimeout(() => setCopiedOpener(false), 2000);
  };

  const attachmentColors: Record<string, string> = {
    Secure: "bg-primary text-black",
    Anxious: "bg-accent text-black",
    Avoidant: "bg-secondary text-white",
    "Fearful-Avoidant": "bg-destructive text-white",
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b-4 border-black pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="font-bold text-gray-500 uppercase text-xs mb-1">Target Decoded</p>
          <h1 className="text-3xl md:text-4xl font-bold font-pixel uppercase tracking-tight">
            {result.targetName}{result.age ? `, ${result.age}` : ""}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="bg-black text-white font-pixel text-[10px] px-2 py-1 uppercase">{result.app}</span>
            <span className="bg-secondary text-white font-pixel text-[10px] px-2 py-1 uppercase">{result.vibeCheck.overallVibe}</span>
          </div>
        </div>
        <button
          onClick={onRedo}
          className="bg-white brutal-border brutal-shadow-sm px-6 py-3 font-bold uppercase hover:-translate-y-1 transition-transform"
        >
          Analyze Another
        </button>
      </div>

      {/* Personality Type Card */}
      <div className="bg-secondary text-white brutal-border brutal-shadow p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6" />
          <h2 className="text-xl font-pixel uppercase">Personality Read</h2>
        </div>
        <p className="font-pixel text-2xl md:text-3xl mb-4">{result.personalityBreakdown.type}</p>
        <p className="font-bold text-white/90 text-sm leading-relaxed">{result.personalityBreakdown.summary}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {result.personalityBreakdown.traits.map((trait, i) => (
            <span key={i} className="bg-white/20 border-2 border-white/30 px-3 py-1 font-bold uppercase text-xs">
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Attachment Style */}
        <div className="bg-white brutal-border brutal-shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5" />
            <h3 className="font-pixel text-sm uppercase">Attachment Style</h3>
          </div>
          <div className={`inline-block px-4 py-2 brutal-border font-pixel text-lg mb-3 ${attachmentColors[result.attachmentStyle.style] || "bg-gray-200"}`}>
            {result.attachmentStyle.style}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-3 bg-gray-100 brutal-border overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${result.attachmentStyle.confidence}%` }} />
            </div>
            <span className="font-bold text-xs">{result.attachmentStyle.confidence}%</span>
          </div>
          <p className="font-bold text-gray-600 text-xs leading-relaxed">{result.attachmentStyle.explanation}</p>
        </div>

        {/* Vibe Check */}
        <div className="bg-white brutal-border brutal-shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5" />
            <h3 className="font-pixel text-sm uppercase">Vibe Check</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-bold text-xs uppercase">Energy Level</span>
                <span className="font-bold text-xs">{result.vibeCheck.energyLevel}/10</span>
              </div>
              <div className="h-3 bg-gray-100 brutal-border overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${result.vibeCheck.energyLevel * 10}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-bold text-xs uppercase">Openness</span>
                <span className="font-bold text-xs">{result.vibeCheck.opennessToConnection}/10</span>
              </div>
              <div className="h-3 bg-gray-100 brutal-border overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${result.vibeCheck.opennessToConnection * 10}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="font-bold text-xs uppercase">Humor:</span>
              <span className="bg-black text-white font-bold text-xs px-2 py-1 uppercase">{result.vibeCheck.humorStyle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Green Flags */}
        <div className="bg-white brutal-border brutal-shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="font-pixel text-sm uppercase text-green-700">Green Flags</h3>
          </div>
          <ul className="space-y-2">
            {result.greenFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">✓</span>
                <span className="font-bold text-sm">{flag}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Red Flags */}
        <div className="bg-white brutal-border brutal-shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-pixel text-sm uppercase text-red-700">Red Flags</h3>
          </div>
          <ul className="space-y-2">
            {result.redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-secondary font-bold mt-0.5">⚠</span>
                <span className="font-bold text-sm">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interests */}
      <div className="bg-white brutal-border brutal-shadow p-6">
        <h3 className="font-pixel text-sm uppercase mb-4">Detected Interests</h3>
        <div className="flex flex-wrap gap-3">
          {result.interests.map((interest, i) => (
            <span key={i} className="bg-accent brutal-border px-4 py-2 font-bold uppercase text-sm brutal-shadow-sm hover:-translate-y-1 transition-transform cursor-default">
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Conversation Hooks */}
      <div className="bg-white brutal-border brutal-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-pixel text-sm uppercase">Conversation Hooks</h3>
        </div>
        <div className="space-y-4">
          {result.conversationHooks.map((hook, i) => (
            <div key={i} className="bg-gray-50 brutal-border p-4">
              <p className="font-bold text-base mb-1">💬 "{hook.hook}"</p>
              <p className="font-bold text-gray-500 text-xs uppercase">↳ {hook.why}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Approach Strategy */}
      <div className="bg-primary brutal-border brutal-shadow p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6" />
          <h2 className="text-xl font-pixel uppercase">Your Strategy</h2>
        </div>

        {/* Best Opening Line */}
        <div className="bg-white brutal-border p-4 mb-6">
          <p className="font-bold text-xs uppercase text-gray-500 mb-2">Best Opening Line</p>
          <div className="flex items-start justify-between gap-4">
            <p className="font-bold text-lg leading-relaxed">"{result.approachStrategy.bestOpeningLine}"</p>
            <button
              onClick={handleCopyOpener}
              className="bg-black text-white p-2 brutal-border hover:scale-105 transition-transform flex-shrink-0"
            >
              {copiedOpener ? <span className="text-xs font-bold px-1">✓</span> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Do This */}
          <div className="bg-white brutal-border p-4">
            <p className="font-pixel text-xs uppercase mb-3 text-green-700">✅ Do This</p>
            <ul className="space-y-2">
              {result.approachStrategy.doThis.map((tip, i) => (
                <li key={i} className="font-bold text-sm flex items-start gap-2">
                  <span className="text-primary mt-0.5">→</span> {tip}
                </li>
              ))}
            </ul>
          </div>
          {/* Avoid This */}
          <div className="bg-white brutal-border p-4">
            <p className="font-pixel text-xs uppercase mb-3 text-red-700">❌ Avoid This</p>
            <ul className="space-y-2">
              {result.approachStrategy.avoidThis.map((tip, i) => (
                <li key={i} className="font-bold text-sm flex items-start gap-2">
                  <span className="text-secondary mt-0.5">→</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white brutal-border p-4">
          <p className="font-bold text-xs uppercase text-gray-500 mb-1">Ideal Tone</p>
          <p className="font-bold">{result.approachStrategy.toneThatWorks}</p>
        </div>
      </div>

      {/* Compatibility Notes */}
      <div className="bg-white brutal-border brutal-shadow p-6">
        <h3 className="font-pixel text-sm uppercase mb-3">Compatibility Intel</h3>
        <p className="font-bold text-gray-700 leading-relaxed">{result.compatibilityNotes}</p>
      </div>
    </div>
  );
}
