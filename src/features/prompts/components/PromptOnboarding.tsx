"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingData {
  gender: string;
  personality: string;
  goals: string;
  humor: string;
  vibe: string;
}

interface PromptOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

const QUESTIONS = [
  {
    id: "gender",
    title: "Who are you?",
    subtitle: "Just the basics so we get the pronouns right.",
    options: ["Male", "Female", "Non-binary", "Other"]
  },
  {
    id: "goals",
    title: "What's the goal here?",
    subtitle: "No judgment, we just need to match the energy.",
    options: ["Something Serious", "Casual Dating", "Just looking around", "Not sure yet"]
  },
  {
    id: "personality",
    title: "How do your friends describe you?",
    subtitle: "Pick the one that hits closest to home.",
    options: ["The Mom/Dad Friend", "Life of the Party", "The Mysterious One", "The Chaotic Good", "The Intellectual", "The Golden Retriever"]
  },
  {
    id: "humor",
    title: "What's your flavor of humor?",
    subtitle: "Because being funny is subjective.",
    options: ["Dry & Sarcastic", "Self-Deprecating", "Witty banter", "Dark & Twisted", "Dad Jokes", "Just goofy"]
  },
  {
    id: "vibe",
    title: "What vibe do you want your profile to give off?",
    subtitle: "This sets the final tone of your prompts.",
    options: ["Flirty but Classy", "Main Character Energy", "Nonchalant & Chill", "Unapologetically Chaotic", "Sweet & Wholesome", "Mysterious & Alluring"]
  }
];

export default function PromptOnboarding({ onComplete }: PromptOnboardingProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    gender: "",
    personality: "",
    goals: "",
    humor: "",
    vibe: ""
  });

  const handleSelect = (value: string) => {
    const currentQ = QUESTIONS[step];
    setData(prev => ({ ...prev, [currentQ.id]: value }));
    
    // Automatically proceed to next step after a tiny delay
    setTimeout(() => {
      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        onComplete({ ...data, [currentQ.id]: value });
      }
    }, 400);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const currentQ = QUESTIONS[step];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white brutal-border brutal-shadow rounded-3xl p-6 md:p-10 min-h-[400px] flex flex-col relative overflow-hidden">
      
      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {QUESTIONS.map((_, i) => (
          <div 
            key={i} 
            className={`h-3 flex-1 brutal-border ${i <= step ? 'bg-primary' : 'bg-gray-100'}`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col relative">
        {step > 0 && (
          <button 
            onClick={handleBack}
            className="absolute -top-4 left-0 p-2 hover:bg-gray-100 brutal-border bg-white brutal-shadow-sm z-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col pt-12 md:pt-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold font-pixel uppercase tracking-tight mb-2">
              {currentQ.title}
            </h2>
            <p className="font-bold text-gray-500 uppercase mb-8">
              {currentQ.subtitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
              {currentQ.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`p-4 text-left font-bold uppercase transition-transform brutal-border text-sm md:text-base
                    ${data[currentQ.id as keyof OnboardingData] === opt 
                      ? 'bg-secondary text-white brutal-shadow-sm translate-x-1 translate-y-1' 
                      : 'bg-white hover:bg-accent hover:-translate-y-1 brutal-shadow-sm'
                    }
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
