"use client";

import { useState, useEffect } from "react";
import {
  Users, Activity, TrendingUp, IndianRupee,
  UserPlus, CheckCircle, XCircle, Clock,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  planCounts: { free: number; pro: number; ultra_pro: number };
  totalAnalyses: number;
  todayAnalyses: number;
  weekAnalyses: number;
  totalRevenue: number;
  recentSignups: Array<{
    id: string;
    email: string;
    plan_type: string;
    created_at: string;
  }>;
  systemHealth: Record<string, boolean>;
}

const healthLabels: Record<string, string> = {
  gemini_api: "Gemini AI",
  supabase: "Supabase DB",
  razorpay: "Razorpay",
  upstash: "Upstash Redis",
  posthog: "PostHog",
  admin_auth: "Admin Auth",
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/admin/login";
        }
        return r.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const StatCard = ({
    label, value, icon: Icon, color, sub,
  }: {
    label: string; value: string | number; icon: any; color: string; sub?: string;
  }) => (
    <div
      className="p-5 flex flex-col justify-between h-36"
      style={{
        background: "#0d0d24",
        border: "3px solid #1a1a3e",
        boxShadow: "4px 4px 0px #000",
      }}
    >
      <div className="flex justify-between items-start">
        <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 ${color} flex items-center justify-center`} style={{ border: "2px solid #000" }}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div>
        <div className="font-pixel text-2xl text-white">
          {loading ? "..." : value}
        </div>
        {sub && <span className="font-mono text-[10px] text-gray-600 uppercase">{sub}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-pixel text-xl text-emerald-400 tracking-wider">DASHBOARD</h1>
        <p className="font-mono text-xs text-gray-600 mt-1 uppercase">System overview & metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={Users} color="bg-emerald-500" />
        <StatCard
          label="API Calls"
          value={stats?.totalAnalyses || 0}
          icon={Activity}
          color="bg-violet-500"
          sub={`${stats?.todayAnalyses || 0} today`}
        />
        <StatCard
          label="This Week"
          value={stats?.weekAnalyses || 0}
          icon={TrendingUp}
          color="bg-cyan-500"
          sub="analyses"
        />
        <StatCard
          label="Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={IndianRupee}
          color="bg-amber-500"
          sub="from razorpay"
        />
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "FREE", count: stats?.planCounts.free || 0, color: "bg-gray-600" },
          { label: "PRO", count: stats?.planCounts.pro || 0, color: "bg-violet-500" },
          { label: "ULTRA PRO", count: stats?.planCounts.ultra_pro || 0, color: "bg-amber-500" },
        ].map((plan) => (
          <div
            key={plan.label}
            className="p-4 flex items-center justify-between"
            style={{
              background: "#0d0d24",
              border: "3px solid #1a1a3e",
              boxShadow: "4px 4px 0px #000",
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 ${plan.color}`} />
              <span className="font-mono text-[11px] text-gray-400 uppercase">{plan.label}</span>
            </div>
            <span className="font-pixel text-lg text-white">{loading ? "..." : plan.count}</span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <div
          className="p-5"
          style={{
            background: "#0d0d24",
            border: "3px solid #1a1a3e",
            boxShadow: "4px 4px 0px #000",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <h2 className="font-pixel text-xs text-emerald-400">RECENT SIGNUPS</h2>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 font-mono text-xs text-gray-600 animate-pulse">LOADING...</div>
            ) : (stats?.recentSignups || []).length === 0 ? (
              <div className="text-center py-8 font-mono text-xs text-gray-600">No signups yet</div>
            ) : (
              stats?.recentSignups.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 px-3"
                  style={{ borderBottom: "1px solid #1a1a3e" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 bg-pink-500/20 flex items-center justify-center flex-shrink-0" style={{ border: "1px solid #1a1a3e" }}>
                      <span className="font-mono text-[9px] text-pink-400">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-gray-300 truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="font-mono text-[9px] px-2 py-0.5 uppercase"
                      style={{
                        background: user.plan_type === "pro" ? "rgba(139,92,246,0.2)" : user.plan_type === "ultra_pro" ? "rgba(245,158,11,0.2)" : "rgba(107,114,128,0.2)",
                        color: user.plan_type === "pro" ? "#a78bfa" : user.plan_type === "ultra_pro" ? "#fbbf24" : "#9ca3af",
                        border: "1px solid #1a1a3e",
                      }}
                    >
                      {user.plan_type || "free"}
                    </span>
                    <span className="font-mono text-[9px] text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(user.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Health */}
        <div
          className="p-5"
          style={{
            background: "#0d0d24",
            border: "3px solid #1a1a3e",
            boxShadow: "4px 4px 0px #000",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="font-pixel text-xs text-emerald-400">SYSTEM HEALTH</h2>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 font-mono text-xs text-gray-600 animate-pulse">CHECKING...</div>
            ) : (
              Object.entries(stats?.systemHealth || {}).map(([key, healthy]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5 px-3"
                  style={{ borderBottom: "1px solid #1a1a3e" }}
                >
                  <span className="font-mono text-[11px] text-gray-400 uppercase">
                    {healthLabels[key] || key}
                  </span>
                  <div className="flex items-center gap-2">
                    {healthy ? (
                      <>
                        <div
                          className="w-2 h-2 bg-emerald-400 animate-pulse"
                          style={{ boxShadow: "0 0 6px #00ff00" }}
                        />
                        <span className="font-mono text-[10px] text-emerald-400">ONLINE</span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      </>
                    ) : (
                      <>
                        <div
                          className="w-2 h-2 bg-red-500 animate-pulse"
                          style={{ boxShadow: "0 0 6px #ff0040" }}
                        />
                        <span className="font-mono text-[10px] text-red-400">OFFLINE</span>
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
