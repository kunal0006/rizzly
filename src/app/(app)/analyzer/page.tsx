"use client";

import { useState, useEffect } from "react";
import { Upload, X, ArrowLeft, RefreshCw, Copy, Check, Sparkles, Coins } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { saveAnalysisToHistory } from "@/lib/history";
import { getTokenBalance, deductTokens, refundTokens } from "@/lib/tokens";

export default function AnalyzerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"upload" | "analyzing" | "results">("upload");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [tokenBalance, setTokenBalance] = useState<number>(10);

  useEffect(() => {
    setTokenBalance(getTokenBalance());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const startAnalysis = async () => {
    if (!file) return;

    // Check token balance before starting
    const currentBalance = getTokenBalance();
    if (currentBalance < 5) {
      alert("You're out of tokens! Redirecting to the Item Shop...");
      router.push("/pricing");
      return;
    }

    // Deduct tokens upfront
    const success = deductTokens();
    if (!success) {
      alert("Not enough tokens! Redirecting to the Item Shop...");
      router.push("/pricing");
      return;
    }
    setTokenBalance(getTokenBalance());

    setStatus("analyzing");
    
    try {
      const formData = new FormData();
      
      // Compress the file before sending
      const compressedFile = await new Promise<File>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new window.Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 1000;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: "image/jpeg" }));
              } else {
                resolve(file); // fallback
              }
            }, "image/jpeg", 0.7);
          };
          img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
      });

      formData.append("image", compressedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errMsg = errorData.error || "Analysis failed";
        if (typeof errMsg === 'object') {
          errMsg = errMsg.message || JSON.stringify(errMsg);
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setAnalysisData(data);
      saveAnalysisToHistory(data);
      setStatus("results");
    } catch (error: any) {
      // Refund tokens on failure
      refundTokens();
      setTokenBalance(getTokenBalance());

      let displayMessage = error.message || "Failed to analyze chat. Please try again.";
      if (displayMessage.includes("503") || displayMessage.includes("high demand")) {
        displayMessage = "The AI is currently experiencing high demand. Please wait a moment and try again. (Tokens refunded!)";
      }
      alert(displayMessage);
      setStatus("upload");
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-mono overflow-x-hidden">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b-4 border-black bg-white sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold hover:bg-black hover:text-white px-2 py-1 transition-colors uppercase">
          <ArrowLeft className="w-5 h-5" />
          <span>Exit</span>
        </Link>
        <Link href="/dashboard" className="font-bold text-2xl font-pixel hover:text-gray-700 transition-colors">
          RIZZLY
        </Link>
        <Link href="/pricing" className="flex items-center gap-2 bg-primary brutal-border px-3 py-1 font-bold hover:-translate-y-1 transition-transform">
          <Coins className="w-5 h-5" />
          <span className="font-pixel text-sm">{tokenBalance}</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-5xl mx-auto relative">
        <AnimatePresence mode="wait">
          
          {/* UPLOAD STATE */}
          {status === "upload" && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-10 border-b-4 border-black pb-4">
                <h1 className="text-3xl md:text-5xl font-pixel mb-4 uppercase">RIZZ UP YOUR CRUSH RIGHT NOW</h1>
                <p className="font-bold text-xl uppercase">Upload screenshot to start</p>
              </div>

              {!previewUrl ? (
                <label className="w-full max-w-xl aspect-[4/3] md:aspect-video brutal-border bg-accent flex flex-col items-center justify-center cursor-pointer brutal-shadow hover:-translate-y-2 transition-transform group relative overflow-hidden">
                  <div className="absolute right-4 bottom-4 w-32 h-32 opacity-20 rotate-[-15deg] group-hover:rotate-0 transition-transform">
                    <Image src="/dino.png" alt="Dino" fill className="object-contain" />
                  </div>
                  <div className="w-20 h-20 bg-white brutal-border brutal-shadow-sm flex items-center justify-center mb-6 z-10 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-black" />
                  </div>
                  <span className="font-pixel text-xl z-10 text-center bg-white px-4 py-2 brutal-border">INSERT FILE</span>
                  <span className="font-bold mt-4 z-10 uppercase bg-black text-white px-2">JPEG / PNG</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="w-full max-w-xl flex flex-col items-center">
                  <div className="relative w-full brutal-border brutal-shadow-sm bg-white p-2">
                    <div className="w-full h-full bg-gray-200 brutal-border overflow-hidden relative flex justify-center bg-black">
                      <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[60vh] object-contain" />
                    </div>
                    <button 
                      onClick={() => { setFile(null); setPreviewUrl(null); }}
                      className="absolute -top-4 -right-4 p-2 bg-primary brutal-border brutal-shadow-sm hover:-translate-y-1 transition-transform"
                    >
                      <X className="w-6 h-6 text-black" />
                    </button>
                  </div>
                  <button 
                    onClick={startAnalysis}
                    className="mt-10 bg-secondary text-white font-pixel text-xl brutal-border brutal-shadow py-4 px-12 flex items-center gap-4 hover:-translate-y-1 transition-transform w-full md:w-auto justify-center"
                  >
                    <Sparkles className="w-6 h-6" /> START ANALYSIS
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ANALYZING STATE */}
          {status === "analyzing" && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center h-64"
            >
              <div className="relative w-full max-w-md h-12 brutal-border bg-white mb-8 p-1 flex">
                <motion.div 
                  className="h-full bg-primary border-r-4 border-black"
                  initial={{ width: "0%" }}
                  animate={{ width: ["0%", "30%", "45%", "80%", "100%"] }}
                  transition={{ duration: 4, ease: "linear" }}
                ></motion.div>
              </div>
              <h2 className="text-2xl md:text-3xl font-pixel mb-2 uppercase animate-pulse">PROCESSING...</h2>
              <p className="font-bold uppercase">Detecting vibes</p>
            </motion.div>
          )}

          {/* RESULTS STATE */}
          {status === "results" && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full grid md:grid-cols-2 gap-10"
            >
              {/* Left Column: Image & Stats */}
              <div className="space-y-6">
                <div className="brutal-border bg-black brutal-shadow-sm p-2 aspect-[4/3] md:aspect-auto md:h-[400px] flex items-center justify-center relative">
                   <div className="absolute top-0 left-0 bg-primary text-black font-bold uppercase px-2 py-1 brutal-border brutal-shadow-sm -translate-x-2 -translate-y-2 z-10">
                     TARGET
                   </div>
                  {previewUrl && <img src={previewUrl} alt="Analyzed Chat" className="w-full h-full object-contain opacity-80" />}
                </div>
                
                <div className="bg-white brutal-border brutal-shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-pixel uppercase">INTEREST</h3>
                    <span className="text-sm font-bold bg-primary px-3 py-1 brutal-border uppercase">{analysisData?.interestLabel || "HIGH"}</span>
                  </div>
                  
                  {/* Retro Health Bar */}
                  <div className="w-full h-8 brutal-border bg-gray-200 p-1 flex mb-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${analysisData?.interestLevel || 85}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-secondary border-r-4 border-black"
                    />
                  </div>
                  <p className="text-sm font-bold text-right uppercase">SCORE: {analysisData?.interestLevel || 85}/100</p>
                  
                  <div className="mt-6 pt-6 border-t-4 border-black">
                    <h4 className="font-bold uppercase mb-2">VIBE LOG:</h4>
                    <p className="text-sm font-bold leading-relaxed bg-accent p-4 brutal-border">
                      {analysisData?.vibeSummary || "Loading analysis..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Suggested Replies */}
              <div className="bg-white brutal-border brutal-shadow-sm p-6 md:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                  <h2 className="text-2xl font-pixel uppercase">INVENTORY</h2>
                  <button onClick={startAnalysis} className="p-3 bg-primary brutal-border brutal-shadow-sm hover:-translate-y-1 transition-transform" title="Reroll">
                    <RefreshCw className="w-6 h-6 text-black" />
                  </button>
                </div>
                
                <div className="space-y-6 flex-1">
                  {(analysisData?.replies || []).map((reply: any, i: number) => (
                    <div key={i} className="group relative bg-white brutal-border brutal-shadow-sm p-5 hover:-translate-y-1 transition-transform">
                      <div className="absolute -top-3 -left-3 bg-black text-white px-3 py-1 font-bold uppercase text-xs">
                        {reply.type}
                      </div>
                      <p className="text-sm md:text-base font-bold pr-12 pt-2">{reply.text}</p>
                      
                      <button 
                        onClick={() => copyToClipboard(reply.text, i)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary brutal-border brutal-shadow-sm flex items-center justify-center hover:bg-secondary hover:text-white transition-colors"
                      >
                        {copiedIndex === i ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                      </button>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setStatus("upload")}
                  className="mt-10 w-full py-4 brutal-border bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors"
                >
                  ADD ANOTHER SCREENSHOT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

