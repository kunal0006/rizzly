"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Search, Download, ChevronLeft, ChevronRight, X } from "lucide-react";

interface User {
  id: string;
  email: string;
  plan_type: string;
  created_at: string;
  token_balance: number;
  free_uses_remaining: number;
  api_calls: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "15" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      // handle error
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handlePlanChange = async (userId: string, planType: string) => {
    setUpdatingPlan(true);
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planType }),
      });
      // Refresh
      fetchUsers();
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, plan_type: planType });
      }
    } catch {
      alert("Failed to update plan");
    }
    setUpdatingPlan(false);
  };

  const handleExport = () => {
    window.open("/api/admin/users/export", "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-pixel text-xl text-emerald-400 tracking-wider">USERS</h1>
          <p className="font-mono text-xs text-gray-600 mt-1 uppercase">
            {total} total users
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase transition-all hover:translate-y-[-2px]"
          style={{ background: "#0d0d24", color: "#a78bfa", border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}
        >
          <Download className="w-4 h-4" /> EXPORT CSV
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-10 pr-4 py-2.5 font-mono text-xs text-white outline-none placeholder:text-gray-700"
            style={{ background: "#0d0d24", border: "3px solid #1a1a3e" }}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 font-mono text-xs text-emerald-400 uppercase"
          style={{ background: "#0d0d24", border: "3px solid #1a1a3e", boxShadow: "3px 3px 0px #000" }}
        >
          SEARCH
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto" style={{ border: "3px solid #1a1a3e", boxShadow: "4px 4px 0px #000" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#0d0d24", borderBottom: "3px solid #1a1a3e" }}>
              {["EMAIL", "PLAN", "TOKENS", "API CALLS", "JOINED", "ACTIONS"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[10px] text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 font-mono text-xs text-gray-600 animate-pulse" style={{ background: "#080818" }}>LOADING...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 font-mono text-xs text-gray-600" style={{ background: "#080818" }}>No users found</td></tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="cursor-pointer hover:bg-white/[0.02] transition-colors"
                  style={{ background: "#080818", borderBottom: "1px solid #1a1a3e" }}
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-[10px] px-2 py-1 uppercase"
                      style={{
                        background: user.plan_type === "pro" ? "rgba(139,92,246,0.2)" : user.plan_type === "ultra_pro" ? "rgba(245,158,11,0.2)" : "rgba(107,114,128,0.2)",
                        color: user.plan_type === "pro" ? "#a78bfa" : user.plan_type === "ultra_pro" ? "#fbbf24" : "#9ca3af",
                        border: "1px solid #1a1a3e",
                      }}
                    >
                      {user.plan_type || "free"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{user.token_balance ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{user.api_calls}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.plan_type || "free"}
                      onChange={(e) => {
                        e.stopPropagation();
                        handlePlanChange(user.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      disabled={updatingPlan}
                      className="font-mono text-[10px] text-gray-300 outline-none px-2 py-1 cursor-pointer"
                      style={{ background: "#0d0d24", border: "1px solid #1a1a3e" }}
                    >
                      <option value="free">FREE</option>
                      <option value="pro">PRO</option>
                      <option value="ultra_pro">ULTRA PRO</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-gray-600 uppercase">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 disabled:opacity-30 text-gray-400 hover:text-white transition-colors"
              style={{ background: "#0d0d24", border: "2px solid #1a1a3e" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 disabled:opacity-30 text-gray-400 hover:text-white transition-colors"
              style={{ background: "#0d0d24", border: "2px solid #1a1a3e" }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex justify-end" onClick={() => setSelectedUser(null)}>
          <div
            className="w-full max-w-md h-full overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#0d0d24", borderLeft: "3px solid #1a1a3e" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-pixel text-xs text-pink-400">USER DETAILS</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "EMAIL", value: selectedUser.email },
                { label: "USER ID", value: selectedUser.id },
                { label: "PLAN", value: selectedUser.plan_type || "free" },
                { label: "TOKENS", value: String(selectedUser.token_balance ?? "—") },
                { label: "FREE USES LEFT", value: String(selectedUser.free_uses_remaining ?? "—") },
                { label: "API CALLS", value: String(selectedUser.api_calls) },
                { label: "JOINED", value: new Date(selectedUser.created_at).toLocaleString() },
              ].map((item) => (
                <div key={item.label} className="p-3" style={{ background: "#080818", border: "2px solid #1a1a3e" }}>
                  <div className="font-mono text-[9px] text-gray-600 uppercase mb-1">{item.label}</div>
                  <div className="font-mono text-sm text-gray-300 break-all">{item.value}</div>
                </div>
              ))}

              <div className="p-3" style={{ background: "#080818", border: "2px solid #1a1a3e" }}>
                <div className="font-mono text-[9px] text-gray-600 uppercase mb-2">CHANGE PLAN</div>
                <div className="flex gap-2">
                  {["free", "pro", "ultra_pro"].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => handlePlanChange(selectedUser.id, plan)}
                      disabled={updatingPlan}
                      className={`px-3 py-2 font-mono text-[10px] uppercase transition-all ${
                        selectedUser.plan_type === plan ? "text-white" : "text-gray-500 hover:text-white"
                      }`}
                      style={{
                        background: selectedUser.plan_type === plan ? "rgba(0,255,0,0.2)" : "#0d0d24",
                        border: `2px solid ${selectedUser.plan_type === plan ? "#00ff00" : "#1a1a3e"}`,
                      }}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
