"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "#0a0a1a" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1a1a3e 1px, transparent 1px), linear-gradient(to bottom, #1a1a3e 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
            style={{
              background: "#00ff00",
              border: "4px solid #000",
              boxShadow: "6px 6px 0px #000, 0 0 20px rgba(0,255,0,0.3)",
            }}
          >
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="font-pixel text-lg text-emerald-400 tracking-wider">ADMIN ACCESS</h1>
          <p className="font-mono text-xs text-gray-600 mt-2 uppercase">Authorized personnel only</p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="space-y-5 p-6"
          style={{
            background: "#0d0d24",
            border: "3px solid #1a1a3e",
            boxShadow: "6px 6px 0px #000",
          }}
        >
          {error && (
            <div
              className="px-4 py-3 font-mono text-xs uppercase text-center"
              style={{
                background: "rgba(255,0,0,0.1)",
                border: "2px solid #ff0040",
                color: "#ff4070",
              }}
            >
              ⚠ {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="font-mono text-[11px] text-gray-500 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@rizzly.com"
              className="w-full px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-500 transition-colors"
              style={{
                background: "#080818",
                border: "2px solid #1a1a3e",
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[11px] text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••"
                className="w-full px-4 py-3 pr-12 font-mono text-sm text-white outline-none placeholder:text-gray-700 focus:border-emerald-500 transition-colors"
                style={{
                  background: "#080818",
                  border: "2px solid #1a1a3e",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 font-pixel text-xs text-black uppercase tracking-wider disabled:opacity-50 transition-all hover:translate-y-[-2px] active:translate-y-[2px]"
            style={{
              background: "#00ff00",
              border: "3px solid #000",
              boxShadow: loading ? "0 0 0 #000" : "4px 4px 0px #000",
            }}
          >
            {loading ? "AUTHENTICATING..." : ">> LOGIN <<"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center flex items-center justify-center gap-2">
          <div
            className="w-2 h-2 animate-pulse"
            style={{
              background: "#00ff00",
              boxShadow: "0 0 6px #00ff00",
            }}
          />
          <span className="font-mono text-[9px] text-gray-700 uppercase">Encrypted connection active</span>
        </div>
      </div>
    </div>
  );
}
