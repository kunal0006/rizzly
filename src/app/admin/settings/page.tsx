"use client";

import { useState } from "react";
import { Settings, CheckCircle, XCircle, Loader2, Zap } from "lucide-react";

interface HealthCheck {
  name: string;
  envKey: string;
  status: "checking" | "ok" | "error";
  testable: boolean;
}

const integrations: Array<{ name: string; envKey: string; testable: boolean }> = [
  { name: "Gemini AI", envKey: "GEMINI_API_KEY", testable: true },
  { name: "Supabase URL", envKey: "NEXT_PUBLIC_SUPABASE_URL", testable: false },
  { name: "Supabase Anon Key", envKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY", testable: false },
  { name: "Supabase Service Key", envKey: "SUPABASE_SERVICE_ROLE_KEY", testable: false },
  { name: "Razorpay Key ID", envKey: "RAZORPAY_KEY_ID", testable: false },
  { name: "Razorpay Secret", envKey: "RAZORPAY_KEY_SECRET", testable: false },
  { name: "Upstash Redis URL", envKey: "UPSTASH_REDIS_REST_URL", testable: false },
  { name: "Upstash Redis Token", envKey: "UPSTASH_REDIS_REST_TOKEN", testable: false },
  { name: "PostHog Key", envKey: "NEXT_PUBLIC_POSTHOG_KEY", testable: false },
  { name: "Admin Email", envKey: "ADMIN_EMAIL", testable: false },
  { name: "Admin JWT Secret", envKey: "ADMIN_JWT_SECRET", testable: false },
];

export default function SettingsPage() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);

  const runHealthCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();

      const checks: HealthCheck[] = integrations.map((int) => {
        let isOk = false;
        const health = data.systemHealth || {};

        if (int.envKey === "GEMINI_API_KEY") isOk = health.gemini_api;
        else if (int.envKey.includes("SUPABASE")) isOk = health.supabase;
        else if (int.envKey.includes("RAZORPAY")) isOk = health.razorpay;
        else if (int.envKey.includes("UPSTASH")) isOk = health.upstash;
        else if (int.envKey.includes("POSTHOG")) isOk = health.posthog;
        else if (int.envKey.includes("ADMIN")) isOk = health.admin_auth;

        return {
          name: int.name,
          envKey: int.envKey,
          status: isOk ? "ok" : "error",
          testable: int.testable,
        };
      });

      setHealthChecks(checks);
    } catch {
      // error
    }
    setChecking(false);
  };

  const testGemini = async () => {
    setTestingGemini(true);
    try {
      const res = await fetch("/api/admin/prompts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Say hello in one word." }),
      });
      const data = await res.json();
      alert(res.ok ? `✅ Gemini works! Response: "${data.output}"` : `❌ Error: ${data.error}`);
    } catch {
      alert("❌ Connection failed");
    }
    setTestingGemini(false);
  };

  const isDev = typeof window !== "undefined" && window.location.hostname === "localhost";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-pixel text-xl text-emerald-400 tracking-wider">SETTINGS</h1>
        <p className="font-mono text-xs text-gray-600 mt-1 uppercase">Integration health & environment</p>
      </div>

      {/* Environment */}
      <div
        className="p-5 flex items-center justify-between"
        style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}
      >
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-gray-400" />
          <div>
            <div className="font-mono text-sm text-white uppercase">Environment</div>
            <div className="font-mono text-[10px] text-gray-600">{typeof window !== "undefined" ? window.location.origin : ""}</div>
          </div>
        </div>
        <span
          className="font-pixel text-[10px] px-3 py-1.5 uppercase"
          style={{
            background: isDev ? "rgba(245,158,11,0.2)" : "rgba(0,255,0,0.2)",
            color: isDev ? "#fbbf24" : "#00ff00",
            border: `2px solid ${isDev ? "#fbbf24" : "#00ff00"}`,
          }}
        >
          {isDev ? "DEVELOPMENT" : "PRODUCTION"}
        </span>
      </div>

      {/* Health Check */}
      <div
        className="p-5"
        style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-xs text-emerald-400">INTEGRATION STATUS</h2>
          <button
            onClick={runHealthCheck}
            disabled={checking}
            className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase transition-all hover:translate-y-[-1px]"
            style={{ background: "#0d0d24", color: "#00ff00", border: "2px solid #1a1a3e", boxShadow: "3px 3px 0px #000" }}
          >
            {checking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            {checking ? "CHECKING..." : "RUN CHECK"}
          </button>
        </div>

        {!healthChecks ? (
          <div className="text-center py-8 font-mono text-xs text-gray-600">
            Click &quot;RUN CHECK&quot; to verify integrations
          </div>
        ) : (
          <div className="space-y-2">
            {healthChecks.map((check) => (
              <div
                key={check.envKey}
                className="flex items-center justify-between py-3 px-3"
                style={{ borderBottom: "1px solid #1a1a3e" }}
              >
                <div>
                  <div className="font-mono text-xs text-gray-300 uppercase">{check.name}</div>
                  <div className="font-mono text-[9px] text-gray-700">{check.envKey}</div>
                </div>
                <div className="flex items-center gap-2">
                  {check.status === "ok" ? (
                    <>
                      <div className="w-2 h-2 bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px #00ff00" }} />
                      <span className="font-mono text-[10px] text-emerald-400">SET</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 animate-pulse" style={{ boxShadow: "0 0 6px #ff0040" }} />
                      <span className="font-mono text-[10px] text-red-400">MISSING</span>
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    </>
                  )}
                  {check.testable && check.status === "ok" && (
                    <button
                      onClick={testGemini}
                      disabled={testingGemini}
                      className="ml-2 px-2 py-1 font-mono text-[9px] text-cyan-400 uppercase hover:bg-cyan-500/10 transition-colors"
                      style={{ border: "1px solid #1a1a3e" }}
                    >
                      {testingGemini ? "..." : "TEST"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
