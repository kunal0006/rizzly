"use client";

import { useState, useCallback } from "react";
import { Upload, X, Camera } from "lucide-react";

interface TargetUploadProps {
  onAnalyze: (screenshots: string[]) => void;
}

export default function TargetUpload({ onAnalyze }: TargetUploadProps) {
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new Image();
        img.src = result;
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
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }
          setScreenshots((prev) => [...prev, canvas.toDataURL("image/jpeg", 0.7)]);
        };
      };
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b-4 border-black pb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-pixel uppercase tracking-tight">
          Target Analyzer
        </h1>
        <p className="font-bold text-gray-500 uppercase mt-3 text-sm md:text-base">
          Upload their profile screenshots. We'll decode their psychology and give you a strategy.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-4 border-dashed p-8 md:p-12 flex flex-col items-center justify-center gap-6 cursor-pointer
          transition-all min-h-[250px]
          ${isDragging 
            ? "border-secondary bg-secondary/10 scale-[1.02]" 
            : "border-black bg-white hover:border-secondary hover:bg-pink-50"
          }
        `}
        onClick={() => document.getElementById("target-file-input")?.click()}
      >
        <input
          id="target-file-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="w-20 h-20 bg-secondary text-white brutal-border brutal-shadow-sm flex items-center justify-center">
          <Camera className="w-10 h-10" />
        </div>

        <div className="text-center">
          <p className="font-pixel text-lg uppercase mb-2">
            {isDragging ? "Drop it!" : "Upload Screenshots"}
          </p>
          <p className="font-bold text-gray-500 uppercase text-xs">
            Drag & drop or click • Tinder, Hinge, Bumble screenshots
          </p>
        </div>
      </div>

      {/* Thumbnails */}
      {screenshots.length > 0 && (
        <div className="space-y-4">
          <p className="font-bold uppercase text-sm">
            {screenshots.length} screenshot{screenshots.length > 1 ? "s" : ""} ready
          </p>
          <div className="flex flex-wrap gap-4">
            {screenshots.map((src, index) => (
              <div key={index} className="relative w-24 h-32 brutal-border brutal-shadow-sm overflow-hidden group bg-white">
                <img
                  src={src}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeScreenshot(index);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-secondary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {screenshots.length > 0 && (
        <button
          onClick={() => onAnalyze(screenshots)}
          className="w-full md:w-auto bg-secondary text-white font-bold py-4 px-8 brutal-border brutal-shadow hover:-translate-y-1 transition-transform uppercase text-lg font-pixel"
        >
          🔍 Decode This Person
        </button>
      )}
    </div>
  );
}
