"use client";

import { useState, useEffect } from "react";
import { ToggleLeft, Save, Loader2 } from "lucide-react";

interface FeatureFlags {
  profile_analyzer_enabled: boolean;
  bio_generator_enabled: boolean;
  maintenance_mode: boolean;
  new_user_signups: boolean;
  free_tier_api_calls_limit: number;
  pro_tier_api_calls_limit: number;
}

const flagDescriptions: Record<string, { label: string; description: string; type: "toggle" | "number" }> = {
  profile_analyzer_enabled: {
    label: "Profile Analyzer",
    description: "Enable/disable the AI profile analyzer feature",
    type: "toggle",
  },
  bio_generator_enabled: {
    label: "Bio Generator",
    description: "Enable/disable the AI bio generator feature",
    type: "toggle",
  },
  maintenance_mode: {
    label: "Maintenance Mode",
    description: "Show maintenance banner on the frontend",
    type: "toggle",
  },
  new_user_signups: {
    label: "New User Signups",
    description: "Allow or block new user registrations",
    type: "toggle",
  },
  free_tier_api_calls_limit: {
    label: "Free Tier API Limit",
    description: "Max API calls per day for free users",
    type: "number",
  },
  pro_tier_api_calls_limit: {
    label: "Pro Tier API Limit",
    description: "Max API calls per day for pro users",
    type: "number",
  },
};

export default function FeaturesPage() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config?key=feature_flags")
      .then((r) => r.json())
      .then((data) => {
        if (data.config?.value) {
          try {
            const parsed = typeof data.config.value === 'string' 
              ? JSON.parse(data.config.value) 
              : data.config.value;
            setFlags(parsed);
          } catch (e) {
            console.error("Failed to parse config:", e);
          }
        } else {
          setFlags({
            profile_analyzer_enabled: true,
            bio_generator_enabled: true,
            maintenance_mode: false,
            new_user_signups: true,
            free_tier_api_calls_limit: 5,
            pro_tier_api_calls_limit: 50,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!flags) return;
    setSaving(true);
    try {
      await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "feature_flags", value: flags }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save");
    }
    setSaving(false);
  };

  const updateFlag = (key: string, value: boolean | number) => {
    if (!flags) return;
    setFlags({ ...flags, [key]: value });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-pixel text-xl text-emerald-400 tracking-wider">FEATURE FLAGS</h1>
          <p className="font-mono text-xs text-gray-600 mt-1 uppercase">Toggle features on/off without deploying</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase disabled:opacity-50 transition-all hover:translate-y-[-2px] active:translate-y-[2px]"
          style={{
            background: saved ? "#00ff00" : "#0d0d24",
            color: saved ? "#000" : "#00ff00",
            border: "3px solid #1a1a3e",
            boxShadow: "4px 4px 0px #000",
          }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "SAVED!" : "SAVE ALL"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 font-mono text-xs text-gray-600 animate-pulse">LOADING FLAGS...</div>
      ) : (
        <div className="space-y-3">
          {Object.entries(flagDescriptions).map(([key, config]) => (
            <div
              key={key}
              className="p-5 flex items-center justify-between gap-4"
              style={{
                background: "#0d0d24",
                border: "3px solid #1a1a3e",
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-8 h-8 bg-cyan-500/20 flex items-center justify-center flex-shrink-0" style={{ border: "2px solid #1a1a3e" }}>
                  <ToggleLeft className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-sm text-white uppercase">{config.label}</div>
                  <div className="font-mono text-[10px] text-gray-600 uppercase mt-0.5">{config.description}</div>
                  <div className="font-mono text-[9px] text-gray-700 mt-1">{key}</div>
                </div>
              </div>

              {config.type === "toggle" ? (
                <button
                  onClick={() => updateFlag(key, !(flags as any)?.[key])}
                  className="flex-shrink-0 w-14 h-7 relative transition-all"
                  style={{
                    background: (flags as any)?.[key] ? "rgba(0,255,0,0.2)" : "rgba(255,0,64,0.2)",
                    border: `2px solid ${(flags as any)?.[key] ? "#00ff00" : "#ff0040"}`,
                  }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 transition-all"
                    style={{
                      background: (flags as any)?.[key] ? "#00ff00" : "#ff0040",
                      boxShadow: `0 0 6px ${(flags as any)?.[key] ? "#00ff00" : "#ff0040"}`,
                      left: (flags as any)?.[key] ? "calc(100% - 24px)" : "2px",
                    }}
                  />
                </button>
              ) : (
                <input
                  type="number"
                  value={(flags as any)?.[key] || 0}
                  onChange={(e) => updateFlag(key, parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 font-mono text-sm text-white text-center outline-none flex-shrink-0"
                  style={{
                    background: "#080818",
                    border: "2px solid #1a1a3e",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
