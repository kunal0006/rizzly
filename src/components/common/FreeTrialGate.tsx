"use client";

import { Crown, Lock } from "lucide-react";
import Link from "next/link";

interface FreeTrialGateProps {
  featureName: string;
  usesRemaining: number;
  onContinue: () => void;
}

export default function FreeTrialGate({ featureName, usesRemaining, onContinue }: FreeTrialGateProps) {
  if (usesRemaining > 0) {
    return (
      <div className="bg-accent brutal-border brutal-shadow p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white px-3 py-1 font-pixel text-xs">FREE TRIAL</div>
          <p className="font-bold uppercase text-sm">
            You have <span className="text-secondary font-pixel">{usesRemaining}</span> free {featureName} use{usesRemaining > 1 ? "s" : ""} remaining
          </p>
        </div>
        <button
          onClick={onContinue}
          className="bg-black text-white px-6 py-3 brutal-border font-bold uppercase hover:-translate-y-1 transition-transform brutal-shadow-sm"
        >
          Use Free Trial
        </button>
      </div>
    );
  }

  // No free uses left — show upgrade wall
  return (
    <div className="bg-white brutal-border brutal-shadow p-8 md:p-12 flex flex-col items-center text-center space-y-6">
      <div className="w-20 h-20 bg-black brutal-border brutal-shadow-sm flex items-center justify-center">
        <Lock className="w-10 h-10 text-accent" />
      </div>
      <h2 className="text-2xl md:text-3xl font-pixel uppercase">Premium Feature</h2>
      <p className="font-bold text-gray-500 uppercase text-sm max-w-md">
        Upgrade to Ultra Pro for unlimited access to the {featureName} and all AI features.
      </p>
      <Link
        href="/pricing"
        className="bg-accent text-black px-8 py-4 brutal-border brutal-shadow font-bold uppercase font-pixel text-lg hover:-translate-y-1 transition-transform flex items-center gap-3"
      >
        <Crown className="w-6 h-6" /> Go Ultra Pro — ₹1,999/mo
      </Link>
    </div>
  );
}
