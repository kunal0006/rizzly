"use client";

import { useCallback, useRef, useState } from "react";
import Thumbnail from "./Thumbnail";

interface UploadScreenProps {
  onAnalyze: (screenshots: string[], photos: string[], app: string | null) => void;
}

const APP_OPTIONS = [
  { id: "Tinder", label: "Tinder 🔥", color: "#FE3C72" },
  { id: "Hinge", label: "Hinge 💜", color: "#E24155" },
  { id: "Bumble", label: "Bumble 🐝", color: "#F4C227" },
];

const MAX_IMAGES = 8;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
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
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export default function UploadScreen({ onAnalyze }: UploadScreenProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [draggingScreenshots, setDraggingScreenshots] = useState(false);
  const [draggingPhotos, setDraggingPhotos] = useState(false);
  const [loading, setLoading] = useState(false);

  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    async (files: FileList | null, type: "screenshots" | "photos") => {
      if (!files) return;
      const current = type === "screenshots" ? screenshots : photos;
      const available = MAX_IMAGES - current.length;
      if (available <= 0) return;

      const validFiles = Array.from(files)
        .filter((f) => ACCEPTED_TYPES.includes(f.type))
        .slice(0, available);

      const base64s = await Promise.all(validFiles.map(fileToBase64));
      if (type === "screenshots") {
        setScreenshots((prev) => [...prev, ...base64s]);
      } else {
        setPhotos((prev) => [...prev, ...base64s]);
      }
    },
    [screenshots, photos]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "screenshots" | "photos") => {
      e.preventDefault();
      if (type === "screenshots") setDraggingScreenshots(false);
      else setDraggingPhotos(false);
      addFiles(e.dataTransfer.files, type);
    },
    [addFiles]
  );

  const canAnalyze = screenshots.length > 0 && !loading;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setLoading(true);
    onAnalyze(screenshots, photos, selectedApp);
  };

  const dropZoneStyle = (isDragging: boolean, gold = false): React.CSSProperties => ({
    border: `2px dashed ${isDragging ? (gold ? "#ffd600" : "#00ff88") : gold ? "#ffd60055" : "#1e1e2e"}`,
    background: isDragging
      ? gold
        ? "#ffd60008"
        : "#00ff8808"
      : "#0d0d14",
    padding: "24px 16px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "12px",
  });

  return (
    <div style={{ padding: "24px 20px", maxWidth: "560px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px", textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: "13px",
            color: "#00ff88",
            marginBottom: "10px",
            lineHeight: 1.5,
          }}
        >
          🦕 PROFILE ANALYZER
        </h1>
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "13px",
            color: "#5a5a7a",
          }}
        >
          Ultra Pro exclusive — get a full profile critique &amp; game plan
        </p>
      </div>

      {/* App Selector */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: "7px",
            color: "#5a5a7a",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          SELECT YOUR APP — AI WILL AUTO-DETECT
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {APP_OPTIONS.map((app) => {
            const isSelected = selectedApp === app.id;
            return (
              <button
                key={app.id}
                id={`app-selector-${app.id.toLowerCase()}`}
                onClick={() =>
                  setSelectedApp((prev) => (prev === app.id ? null : app.id))
                }
                style={{
                  fontFamily: "'Press Start 2P', 'Courier New', monospace",
                  fontSize: "8px",
                  padding: "10px 14px",
                  background: isSelected ? `${app.color}20` : "#13131e",
                  color: isSelected ? app.color : "#b0b0cc",
                  border: `2px solid ${isSelected ? app.color : "#1e1e2e"}`,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  boxShadow: isSelected ? `0 0 12px ${app.color}60` : "none",
                  transition: "all 0.15s ease",
                  flex: "1",
                  minWidth: "90px",
                }}
              >
                {app.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Screenshots Upload */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: "7px",
            color: "#00ff88",
            marginBottom: "10px",
            textTransform: "uppercase",
          }}
        >
          PROFILE SCREENSHOTS *
        </div>
        <div
          id="screenshots-dropzone"
          style={dropZoneStyle(draggingScreenshots)}
          onDragOver={(e) => {
            e.preventDefault();
            setDraggingScreenshots(true);
          }}
          onDragLeave={() => setDraggingScreenshots(false)}
          onDrop={(e) => handleDrop(e, "screenshots")}
          onClick={() => screenshotInputRef.current?.click()}
        >
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>📱</div>
          <div
            style={{
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              fontSize: "7px",
              color: "#5a5a7a",
              marginBottom: "6px",
            }}
          >
            DRAG & DROP OR CLICK TO BROWSE
          </div>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "11px",
              color: "#3a3a5a",
            }}
          >
            JPG, PNG, WEBP · Max {MAX_IMAGES} images
          </div>
        </div>
        <input
          ref={screenshotInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files, "screenshots")}
          id="screenshots-input"
        />
        {screenshots.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            {screenshots.map((src, i) => (
              <Thumbnail
                key={i}
                src={src}
                onRemove={() =>
                  setScreenshots((prev) => prev.filter((_, idx) => idx !== i))
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Photos Upload */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              fontSize: "7px",
              color: "#ffd600",
              textTransform: "uppercase",
            }}
          >
            PROFILE PHOTOS
          </div>
          <span
            style={{
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              fontSize: "6px",
              background: "#ffd600",
              color: "#000",
              padding: "2px 6px",
            }}
          >
            ULTRA PRO
          </span>
        </div>
        <div
          id="photos-dropzone"
          style={dropZoneStyle(draggingPhotos, true)}
          onDragOver={(e) => {
            e.preventDefault();
            setDraggingPhotos(true);
          }}
          onDragLeave={() => setDraggingPhotos(false)}
          onDrop={(e) => handleDrop(e, "photos")}
          onClick={() => photoInputRef.current?.click()}
        >
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>📸</div>
          <div
            style={{
              fontFamily: "'Press Start 2P', 'Courier New', monospace",
              fontSize: "7px",
              color: "#ffd60099",
              marginBottom: "6px",
            }}
          >
            INDIVIDUAL PHOTOS FOR CRITIQUE
          </div>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "11px",
              color: "#5a5a3a",
            }}
          >
            Optional but recommended · Max {MAX_IMAGES} photos
          </div>
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files, "photos")}
          id="photos-input"
        />
        {photos.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            {photos.map((src, i) => (
              <Thumbnail
                key={i}
                src={src}
                gold
                onRemove={() =>
                  setPhotos((prev) => prev.filter((_, idx) => idx !== i))
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div>
        <button
          id="analyze-btn"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          style={{
            width: "100%",
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: "11px",
            padding: "18px",
            background: canAnalyze ? "#00ff88" : "#1e1e2e",
            color: canAnalyze ? "#000" : "#3a3a5a",
            border: "none",
            cursor: canAnalyze ? "pointer" : "not-allowed",
            textTransform: "uppercase",
            boxShadow: canAnalyze ? "4px 4px 0px #007744" : "none",
            transition: "all 0.1s ease",
            letterSpacing: "0.05em",
          }}
        >
          ⚡ ANALYZE MY PROFILE
        </button>
        <div
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: "7px",
            color: "#5a5a7a",
            textAlign: "center",
            marginTop: "10px",
            textTransform: "uppercase",
          }}
        >
          {screenshots.length}/{MAX_IMAGES} SCREENSHOTS •{" "}
          {photos.length}/{MAX_IMAGES} PHOTOS
        </div>
      </div>
    </div>
  );
}
