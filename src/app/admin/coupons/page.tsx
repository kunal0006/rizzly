"use client";

import { useState, useEffect } from "react";
import {
  Ticket, Plus, Trash2, Copy, Loader2, Zap, Download, X, Check,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  applicable_plan: string;
  is_active: boolean;
  created_at: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create form state
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: 10,
    max_uses: "",
    expires_at: "",
    applicable_plan: "all",
  });

  // Bulk form state
  const [bulkForm, setBulkForm] = useState({
    count: 5,
    discount_type: "percentage",
    discount_value: 10,
    max_uses: "",
    applicable_plan: "all",
  });

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch { /* handle */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
          expires_at: form.expires_at || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
      } else {
        setShowCreate(false);
        setForm({ code: "", discount_type: "percentage", discount_value: 10, max_uses: "", expires_at: "", applicable_plan: "all" });
        fetchCoupons();
      }
    } catch {
      alert("Failed to create");
    }
    setCreating(false);
  };

  const handleBulkGenerate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/coupons/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bulkForm,
          max_uses: bulkForm.max_uses ? parseInt(bulkForm.max_uses as string) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowBulk(false);
        fetchCoupons();
        alert(`Generated ${data.count} coupons!`);
      } else {
        alert(data.error);
      }
    } catch {
      alert("Failed to generate");
    }
    setCreating(false);
  };

  const toggleActive = async (coupon: Coupon) => {
    await fetch("/api/admin/coupons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: coupon.id, is_active: !coupon.is_active }),
    });
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
    fetchCoupons();
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "RIZZLY";
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm({ ...form, code });
  };

  const handleExport = () => {
    const headers = ["Code", "Discount", "Max Uses", "Used", "Expires", "Plan", "Active"];
    const rows = coupons.map((c) => [
      c.code,
      `${c.discount_value}${c.discount_type === "percentage" ? "%" : " flat"}`,
      c.max_uses ?? "unlimited",
      c.used_count,
      c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "never",
      c.applicable_plan,
      c.is_active ? "yes" : "no",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rizzly-coupons.csv";
    a.click();
  };

  const inputStyle = { background: "#080818", border: "2px solid #1a1a3e" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-pixel text-xl text-emerald-400 tracking-wider">COUPONS</h1>
          <p className="font-mono text-xs text-gray-600 mt-1 uppercase">{coupons.length} total coupons</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase text-gray-400 hover:text-white transition-colors"
            style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "3px 3px 0px #000" }}
          >
            <Download className="w-3 h-3" /> CSV
          </button>
          <button
            onClick={() => setShowBulk(true)}
            className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase text-amber-400"
            style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "3px 3px 0px #000" }}
          >
            <Zap className="w-3 h-3" /> BULK
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase text-emerald-400"
            style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}
          >
            <Plus className="w-4 h-4" /> CREATE
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="overflow-x-auto" style={{ border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#0d0d24", borderBottom: "3px solid #1a1a3e" }}>
              {["CODE", "DISCOUNT", "USES", "EXPIRY", "PLAN", "STATUS", "ACTIONS"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[10px] text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 font-mono text-xs text-gray-600 animate-pulse" style={{ background: "#080818" }}>LOADING...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 font-mono text-xs text-gray-600" style={{ background: "#080818" }}>No coupons yet</td></tr>
            ) : (
              coupons.map((c) => {
                const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                return (
                  <tr key={c.id} className="hover:bg-white/[0.02]" style={{ background: "#080818", borderBottom: "1px solid #1a1a3e" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white font-bold">{c.code}</span>
                        <button
                          onClick={() => copyCode(c.code, c.id)}
                          className="text-gray-600 hover:text-white transition-colors"
                        >
                          {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-300">
                      {c.discount_value}{c.discount_type === "percentage" ? "%" : "₹"} OFF
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {c.used_count} / {c.max_uses ?? "∞"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-gray-500">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-gray-400 uppercase">{c.applicable_plan}</td>
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-[9px] px-2 py-1 uppercase"
                        style={{
                          background: isExpired ? "rgba(239,68,68,0.2)" : c.is_active ? "rgba(0,255,0,0.2)" : "rgba(245,158,11,0.2)",
                          color: isExpired ? "#ef4444" : c.is_active ? "#00ff00" : "#f59e0b",
                          border: "1px solid #1a1a3e",
                        }}
                      >
                        {isExpired ? "EXPIRED" : c.is_active ? "ACTIVE" : "PAUSED"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(c)}
                          className="px-2 py-1 font-mono text-[9px] uppercase text-gray-400 hover:text-white transition-colors"
                          style={{ border: "1px solid #1a1a3e" }}
                        >
                          {c.is_active ? "PAUSE" : "ACTIVATE"}
                        </button>
                        <button onClick={() => deleteCoupon(c.id)} className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <form
            onSubmit={handleCreate}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 space-y-4"
            style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "6px 6px 0px #000" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-xs text-emerald-400">CREATE COUPON</h3>
              <button type="button" onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Code</label>
              <div className="flex gap-2">
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="RIZZLY50"
                  className="flex-1 px-3 py-2 font-mono text-sm text-white outline-none"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="px-3 py-2 font-mono text-[10px] text-amber-400 uppercase"
                  style={{ background: "#0d0d24", border: "2px solid #1a1a3e" }}
                >
                  RANDOM
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Type</label>
                <select
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                  className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                  style={inputStyle}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Value</label>
                <input
                  type="number"
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Max Uses (blank = unlimited)</label>
                <input
                  type="number"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  placeholder="∞"
                  className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Applicable Plan</label>
              <select
                value={form.applicable_plan}
                onChange={(e) => setForm({ ...form, applicable_plan: e.target.value })}
                className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                style={inputStyle}
              >
                <option value="all">All Plans</option>
                <option value="pro">Pro Only</option>
                <option value="ultra_pro">Ultra Pro Only</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 font-pixel text-xs text-black uppercase disabled:opacity-50"
              style={{ background: "#00ff00", border: "3px solid #000", boxShadow: "4px 4px 0px #000" }}
            >
              {creating ? "CREATING..." : "CREATE COUPON"}
            </button>
          </form>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulk && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setShowBulk(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 space-y-4"
            style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "6px 6px 0px #000" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-xs text-amber-400">BULK GENERATE</h3>
              <button onClick={() => setShowBulk(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Number of Codes (max 100)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={bulkForm.count}
                onChange={(e) => setBulkForm({ ...bulkForm, count: Number(e.target.value) })}
                className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Discount Type</label>
                <select
                  value={bulkForm.discount_type}
                  onChange={(e) => setBulkForm({ ...bulkForm, discount_type: e.target.value })}
                  className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                  style={inputStyle}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Value</label>
                <input
                  type="number"
                  value={bulkForm.discount_value}
                  onChange={(e) => setBulkForm({ ...bulkForm, discount_value: Number(e.target.value) })}
                  className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              onClick={handleBulkGenerate}
              disabled={creating}
              className="w-full py-3 font-pixel text-xs text-black uppercase disabled:opacity-50"
              style={{ background: "#fbbf24", border: "3px solid #000", boxShadow: "4px 4px 0px #000" }}
            >
              {creating ? "GENERATING..." : `GENERATE ${bulkForm.count} CODES`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
