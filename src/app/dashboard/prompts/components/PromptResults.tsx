"use client";

import { Copy, RefreshCw, BookmarkPlus } from "lucide-react";
import { useState } from "react";

interface PromptOption {
  app: string;
  promptQuestion: string;
  promptAnswer: string;
  explanation: string;
}

interface PromptResultsProps {
  prompts: PromptOption[];
  onRemix: () => void;
  isRemixing: boolean;
}

export default function PromptResults({ prompts, onRemix, isRemixing }: PromptResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-6">
        <div>
          <h2 className="text-3xl font-bold font-pixel uppercase">Your Prompts</h2>
          <p className="font-bold text-gray-500 uppercase mt-2">Custom-tailored for your exact vibe.</p>
        </div>
        <button
          onClick={onRemix}
          disabled={isRemixing}
          className="flex items-center gap-2 bg-accent brutal-border brutal-shadow-sm px-6 py-3 font-bold uppercase hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <RefreshCw className={`w-5 h-5 ${isRemixing ? 'animate-spin' : ''}`} />
          {isRemixing ? "REMIXING..." : "REMIX TONE"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prompts.map((prompt, index) => (
          <div key={index} className="bg-white brutal-border brutal-shadow rounded-2xl flex flex-col overflow-hidden group">
            
            {/* Header */}
            <div className="bg-primary border-b-4 border-black p-4 flex justify-between items-center">
              <span className="font-pixel text-[10px] uppercase bg-black text-white px-2 py-1">
                {prompt.app}
              </span>
              <button 
                onClick={() => handleCopy(prompt.promptAnswer, index)}
                className="hover:scale-110 transition-transform p-1 bg-white brutal-border brutal-shadow-sm"
                title="Copy Answer"
              >
                {copiedIndex === index ? (
                  <span className="font-bold text-xs uppercase px-1 text-secondary">Copied!</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">PROMPT</span>
                <h3 className="font-bold text-lg leading-tight">{prompt.promptQuestion}</h3>
              </div>
              
              <div className="bg-gray-100 p-4 border-l-4 border-secondary flex-1">
                <span className="text-xs font-bold text-secondary uppercase block mb-1">YOUR ANSWER</span>
                <p className="font-mono font-bold">{prompt.promptAnswer}</p>
              </div>

              <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase">
                  💡 <span className="text-black">{prompt.explanation}</span>
                </p>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
