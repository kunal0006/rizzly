"use client";

import { useState, useEffect } from "react";
import { Megaphone, Save, Loader2, ExternalLink } from "lucide-react";

interface Announcement {
  enabled: boolean;
  text: string;
  color: string;
  ctaText: string;
  ctaUrl: string;
  expiresAt: string | null;
}

const colorPresets = [
  { id: "info", label: "INFO", bg: "#1e40af", text: "#93c5fd" },
  { id: "warning", label: "WARNING", bg: "#92400e", text: "#fbbf24" },
  { id: "success", label: "SUCCESS", bg: "#065f46", text: "#6ee7b7" },
  { id: "promo", label: "PROMO", bg: "#7c2d12", text: "#fb923c" },
  { id: "pink", label: "PROMO 2", bg: "#831843", text: "#f9a8d4" },
];

export default function AnnouncementsPage() {
  const [announcement, setAnnouncement] = useState<Announcement>({
    enabled: false,
    text: "",
    color: "info",
    ctaText: "",
    ctaUrl: "",
    expiresAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config?key=announcement")
      .then((r) => r.json())
      .then((data) => {
        if (data.config?.value) {
          setAnnouncement(JSON.parse(data.config.value));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "announcement", value: announcement }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save");
    }
    setSaving(false);
  };

  const currentPreset = colorPresets.find((p) => p.id === announcement.color) || colorPresets[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-pixel text-xl text-emerald-400 tracking-wider">ANNOUNCEMENTS</h1>
          <p className="font-mono text-xs text-gray-600 mt-1 uppercase">Control the sitewide announcement banner</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase disabled:opacity-50 transition-all hover:translate-y-[-2px]"
          style={{
            background: saved ? "#00ff00" : "#0d0d24",
            color: saved ? "#000" : "#00ff00",
            border: "3px solid #1a1a3e",
            boxShadow: "4px 4px 0px #000",
          }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "SAVED!" : "SAVE"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 font-mono text-xs text-gray-600 animate-pulse">LOADING...</div>
      ) : (
        <>
          {/* Toggle */}
          <div
            className="p-5 flex items-center justify-between"
            style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}
          >
            <div className="flex items-center gap-3">
              <Megaphone className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="font-mono text-sm text-white uppercase">Banner Status</div>
                <div className="font-mono text-[10px] text-gray-600">
                  {announcement.enabled ? "Live on all pages" : "Hidden from visitors"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setAnnouncement({ ...announcement, enabled: !announcement.enabled })}
              className="w-14 h-7 relative transition-all"
              style={{
                background: announcement.enabled ? "rgba(0,255,0,0.2)" : "rgba(255,0,64,0.2)",
                border: `2px solid ${announcement.enabled ? "#00ff00" : "#ff0040"}`,
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 transition-all"
                style={{
                  background: announcement.enabled ? "#00ff00" : "#ff0040",
                  boxShadow: `0 0 6px ${announcement.enabled ? "#00ff00" : "#ff0040"}`,
                  left: announcement.enabled ? "calc(100% - 24px)" : "2px",
                }}
              />
            </button>
          </div>

          {/* Settings */}
          <div
            className="p-5 space-y-4"
            style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}
          >
            <div>
              <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Banner Text</label>
              <input
                value={announcement.text}
                onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                placeholder="🎉 50% off Pro this week!"
                className="w-full px-4 py-2.5 font-mono text-sm text-white outline-none"
                style={{ background: "#080818", border: "2px solid #1a1a3e" }}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-gray-600 uppercase block mb-2">Color Preset</label>
              <div className="flex gap-2 flex-wrap">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setAnnouncement({ ...announcement, color: preset.id })}
                    className="px-3 py-2 font-mono text-[10px] uppercase transition-all"
                    style={{
                      background: preset.bg,
                      color: preset.text,
                      border: announcement.color === preset.id ? "3px solid #fff" : "3px solid transparent",
                      boxShadow: announcement.color === preset.id ? "0 0 10px rgba(255,255,255,0.2)" : "none",
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">CTA Button Text (optional)</label>
                <input
                  value={announcement.ctaText}
                  onChange={(e) => setAnnouncement({ ...announcement, ctaText: e.target.value })}
                  placeholder="Upgrade Now"
                  className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                  style={{ background: "#080818", border: "2px solid #1a1a3e" }}
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">CTA URL</label>
                <input
                  value={announcement.ctaUrl}
                  onChange={(e) => setAnnouncement({ ...announcement, ctaUrl: e.target.value })}
                  placeholder="/pricing"
                  className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                  style={{ background: "#080818", border: "2px solid #1a1a3e" }}
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Auto-Expire (optional)</label>
              <input
                type="datetime-local"
                value={announcement.expiresAt || ""}
                onChange={(e) => setAnnouncement({ ...announcement, expiresAt: e.target.value || null })}
                className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                style={{ background: "#080818", border: "2px solid #1a1a3e" }}
              />
            </div>
          </div>

          {/* Preview */}
          {announcement.text && (
            <div>
              <h3 className="font-pixel text-xs text-gray-500 mb-2">PREVIEW</h3>
              <div
                className="px-4 py-3 flex items-center justify-center gap-3 font-mono text-sm"
                style={{
                  background: currentPreset.bg,
                  color: currentPreset.text,
                  border: "2px solid rgba(255,255,255,0.1)",
                }}
              >
                <span>{announcement.text}</span>
                {announcement.ctaText && (
                  <span
                    className="px-3 py-1 font-bold text-xs uppercase flex items-center gap-1"
                    style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
                  >
                    {announcement.ctaText} <ExternalLink className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
