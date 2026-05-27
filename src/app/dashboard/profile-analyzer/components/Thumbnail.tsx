"use client";

interface ThumbnailProps {
  src: string;
  onRemove: () => void;
  gold?: boolean;
}

export default function Thumbnail({ src, onRemove, gold = false }: ThumbnailProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "80px",
        height: "80px",
        flexShrink: 0,
        border: gold ? "2px solid #ffd600" : "2px solid #1e1e2e",
        overflow: "hidden",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Upload preview"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <button
        onClick={onRemove}
        aria-label="Remove image"
        style={{
          position: "absolute",
          top: "2px",
          right: "2px",
          width: "18px",
          height: "18px",
          background: "#ff2d7c",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "8px",
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
