"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Clock, Users } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface AnalyticsData {
  dailyData: Array<{ date: string; calls: number }>;
  featureData: Array<{ name: string; value: number }>;
  planDistData: Array<{ name: string; value: number }>;
  metrics: {
    avgCallsPerUser: string;
    mostActiveHour: string;
    totalCalls30d: number;
  };
}

const COLORS = ["#00ff00", "#a78bfa", "#fbbf24", "#f472b6", "#22d3ee"];
const PLAN_COLORS: Record<string, string> = {
  free: "#6b7280",
  pro: "#a78bfa",
  ultra_pro: "#fbbf24",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const MetricCard = ({
    label, value, icon: Icon, color,
  }: {
    label: string; value: string | number; icon: any; color: string;
  }) => (
    <div
      className="p-4 flex items-center gap-4"
      style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}
    >
      <div className={`w-10 h-10 ${color} flex items-center justify-center`} style={{ border: "2px solid #000" }}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="font-pixel text-lg text-white">{value}</div>
        <div className="font-mono text-[10px] text-gray-600 uppercase">{label}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-pixel text-xl text-emerald-400 tracking-wider">ANALYTICS</h1>
        </div>
        <div className="text-center py-20 font-mono text-xs text-gray-600 animate-pulse">CRUNCHING DATA...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-pixel text-xl text-emerald-400 tracking-wider">ANALYTICS</h1>
        <p className="font-mono text-xs text-gray-600 mt-1 uppercase">Usage stats & insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Avg Calls/User (30d)" value={data?.metrics.avgCallsPerUser || "0"} icon={TrendingUp} color="bg-emerald-500" />
        <MetricCard label="Most Active Hour" value={data?.metrics.mostActiveHour || "—"} icon={Clock} color="bg-violet-500" />
        <MetricCard label="Total Calls (30d)" value={data?.metrics.totalCalls30d || 0} icon={BarChart3} color="bg-cyan-500" />
      </div>

      {/* Line Chart: Daily API Calls */}
      <div
        className="p-5"
        style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}
      >
        <h2 className="font-pixel text-xs text-emerald-400 mb-4">DAILY API CALLS (30 DAYS)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.dailyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3e" />
              <XAxis
                dataKey="date"
                stroke="#4a4a6a"
                tick={{ fontSize: 9, fontFamily: "monospace", fill: "#6b7280" }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis
                stroke="#4a4a6a"
                tick={{ fontSize: 9, fontFamily: "monospace", fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={{
                  background: "#0d0d24",
                  border: "2px solid #1a1a3e",
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#fff",
                }}
              />
              <Line type="monotone" dataKey="calls" stroke="#00ff00" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar Chart: Feature Usage */}
        <div
          className="p-5"
          style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}
        >
          <h2 className="font-pixel text-xs text-amber-400 mb-4">FEATURE USAGE</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.featureData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3e" />
                <XAxis
                  dataKey="name"
                  stroke="#4a4a6a"
                  tick={{ fontSize: 8, fontFamily: "monospace", fill: "#6b7280" }}
                />
                <YAxis
                  stroke="#4a4a6a"
                  tick={{ fontSize: 9, fontFamily: "monospace", fill: "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0d0d24",
                    border: "2px solid #1a1a3e",
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                  {(data?.featureData || []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Plan Distribution */}
        <div
          className="p-5"
          style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}
        >
          <h2 className="font-pixel text-xs text-pink-400 mb-4">USER DISTRIBUTION</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.planDistData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {(data?.planDistData || []).map((entry) => (
                    <Cell key={entry.name} fill={PLAN_COLORS[entry.name] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#0d0d24",
                    border: "2px solid #1a1a3e",
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#fff",
                  }}
                />
                <Legend
                  formatter={(value) => <span style={{ fontFamily: "monospace", fontSize: 10, color: "#9ca3af", textTransform: "uppercase" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
