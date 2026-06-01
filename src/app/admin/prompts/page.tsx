"use client";

import { useState, useEffect } from "react";
import { MessageSquareCode, Save, Loader2, Play, History, RotateCcw, X } from "lucide-react";

interface PromptVersion {
  id: string;
  prompt_key: string;
  content: string;
  created_at: string;
}

const defaultPrompts: Record<string, { label: string; description: string; defaultValue: string }> = {
  bio_generator_system_prompt: {
    label: "Bio Generator",
    description: "System prompt for generating dating app bios",
    defaultValue: "You are an elite dating profile ghostwriter...",
  },
  profile_analyzer_system_prompt: {
    label: "Profile Analyzer",
    description: "System prompt for analyzing self-profiles",
    defaultValue: "You are a dating profile optimization expert...",
  },
  target_analyzer_system_prompt: {
    label: "Target Analyzer",
    description: "System prompt for decoding target profiles",
    defaultValue: "You're a friend who's annoyingly good at reading people on dating apps...",
  },
  chat_analyzer_system_prompt: {
    label: "Chat Analyzer",
    description: "System prompt for analyzing chat screenshots",
    defaultValue: "You are an AI dating assistant analyzing chat conversations...",
  },
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  // Test modal state
  const [testModal, setTestModal] = useState<{
    key: string;
    output: string | null;
    loading: boolean;
    sampleInput: string;
  } | null>(null);

  // Version history state
  const [versionModal, setVersionModal] = useState<{
    key: string;
    versions: PromptVersion[];
    loading: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/prompts")
      .then((r) => r.json())
      .then((data) => {
        const merged: Record<string, string> = {};
        Object.entries(defaultPrompts).forEach(([key, config]) => {
          merged[key] = data.prompts?.[key] || config.defaultValue;
        });
        setPrompts(merged);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (key: string) => {
    setSavingKey(key);
    try {
      await fetch("/api/admin/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptKey: key, content: prompts[key] }),
      });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch {
      alert("Failed to save");
    }
    setSavingKey(null);
  };

  const handleTest = async (key: string) => {
    setTestModal({ key, output: null, loading: true, sampleInput: "" });
    try {
      const res = await fetch("/api/admin/prompts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompts[key] }),
      });
      const data = await res.json();
      setTestModal((prev) => prev ? { ...prev, output: data.output || data.error, loading: false } : null);
    } catch {
      setTestModal((prev) => prev ? { ...prev, output: "Request failed", loading: false } : null);
    }
  };

  const handleViewVersions = async (key: string) => {
    setVersionModal({ key, versions: [], loading: true });
    try {
      const res = await fetch(`/api/admin/prompts/versions?promptKey=${key}`);
      const data = await res.json();
      setVersionModal({ key, versions: data.versions || [], loading: false });
    } catch {
      setVersionModal((prev) => prev ? { ...prev, loading: false } : null);
    }
  };

  const handleRestore = async (key: string, content: string) => {
    try {
      await fetch("/api/admin/prompts/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptKey: key, content }),
      });
      setPrompts((prev) => ({ ...prev, [key]: content }));
      setVersionModal(null);
    } catch {
      alert("Failed to restore version");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-pixel text-xl text-emerald-400 tracking-wider">PROMPTS</h1>
        <p className="font-mono text-xs text-gray-600 mt-1 uppercase">Manage AI system prompts with version history</p>
      </div>

      {loading ? (
        <div className="text-center py-16 font-mono text-xs text-gray-600 animate-pulse">LOADING PROMPTS...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(defaultPrompts).map(([key, config]) => (
            <div
              key={key}
              className="p-5"
              style={{
                background: "#0d0d24",
                border: "3px solid #1a1a3e",
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/20 flex items-center justify-center" style={{ border: "2px solid #1a1a3e" }}>
                    <MessageSquareCode className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-white uppercase">{config.label}</div>
                    <div className="font-mono text-[10px] text-gray-600 uppercase">{config.description}</div>
                    <div className="font-mono text-[9px] text-gray-700 mt-0.5">{key}</div>
                  </div>
                </div>
              </div>

              <textarea
                value={prompts[key] || ""}
                onChange={(e) => setPrompts({ ...prompts, [key]: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 font-mono text-xs text-gray-300 outline-none resize-y"
                style={{
                  background: "#080818",
                  border: "2px solid #1a1a3e",
                  lineHeight: "1.6",
                }}
              />

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleSave(key)}
                  disabled={savingKey === key}
                  className="flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase transition-all hover:translate-y-[-1px]"
                  style={{
                    background: savedKey === key ? "#00ff00" : "#0d0d24",
                    color: savedKey === key ? "#000" : "#00ff00",
                    border: "2px solid #1a1a3e",
                    boxShadow: "3px 3px 0px #000",
                  }}
                >
                  {savingKey === key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  {savedKey === key ? "SAVED!" : "SAVE"}
                </button>
                <button
                  onClick={() => handleTest(key)}
                  className="flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] text-cyan-400 uppercase transition-all hover:translate-y-[-1px]"
                  style={{ background: "#0d0d24", border: "2px solid #1a1a3e", boxShadow: "3px 3px 0px #000" }}
                >
                  <Play className="w-3 h-3" /> TEST
                </button>
                <button
                  onClick={() => handleViewVersions(key)}
                  className="flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] text-violet-400 uppercase transition-all hover:translate-y-[-1px]"
                  style={{ background: "#0d0d24", border: "2px solid #1a1a3e", boxShadow: "3px 3px 0px #000" }}
                >
                  <History className="w-3 h-3" /> VERSIONS
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test Output Modal */}
      {testModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setTestModal(null)}>
          <div
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "6px 6px 0px #000" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-pixel text-xs text-cyan-400">TEST OUTPUT</h3>
              <button onClick={() => setTestModal(null)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {testModal.loading ? (
              <div className="text-center py-12 font-mono text-xs text-gray-600 animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
                RUNNING PROMPT...
              </div>
            ) : (
              <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap p-4" style={{ background: "#080818", border: "2px solid #1a1a3e" }}>
                {testModal.output}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {versionModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setVersionModal(null)}>
          <div
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "6px 6px 0px #000" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-pixel text-xs text-violet-400">VERSION HISTORY</h3>
              <button onClick={() => setVersionModal(null)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {versionModal.loading ? (
              <div className="text-center py-12 font-mono text-xs text-gray-600 animate-pulse">LOADING...</div>
            ) : versionModal.versions.length === 0 ? (
              <div className="text-center py-12 font-mono text-xs text-gray-600">No version history yet</div>
            ) : (
              <div className="space-y-3">
                {versionModal.versions.map((v) => (
                  <div key={v.id} className="p-4" style={{ background: "#080818", border: "2px solid #1a1a3e" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-gray-500">
                        {new Date(v.created_at).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleRestore(versionModal.key, v.content)}
                        className="flex items-center gap-1 px-2 py-1 font-mono text-[9px] text-amber-400 uppercase hover:bg-amber-500/10 transition-colors"
                        style={{ border: "1px solid #1a1a3e" }}
                      >
                        <RotateCcw className="w-3 h-3" /> RESTORE
                      </button>
                    </div>
                    <pre className="font-mono text-[10px] text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {v.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
