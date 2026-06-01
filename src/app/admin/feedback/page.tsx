"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Star, CheckCircle, Mail, Eye } from "lucide-react";

interface FeedbackItem {
  id: string;
  user_email: string | null;
  message: string;
  page_url: string | null;
  is_read: boolean;
  is_starred: boolean;
  is_resolved: boolean;
  created_at: string;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");

  const fetchFeedback = async () => {
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      setFeedback(data.feedback || []);
    } catch { /* handle */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const updateFeedback = async (id: string, updates: Partial<FeedbackItem>) => {
    await fetch("/api/admin/feedback", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    fetchFeedback();
  };

  const filteredFeedback = feedback.filter((f) => {
    if (filter === "unread") return !f.is_read;
    if (filter === "starred") return f.is_starred;
    return true;
  });

  const unreadCount = feedback.filter((f) => !f.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-pixel text-xl text-emerald-400 tracking-wider">FEEDBACK</h1>
          <p className="font-mono text-xs text-gray-600 mt-1 uppercase">
            {feedback.length} total · {unreadCount} unread
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "unread", "starred"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-2 font-mono text-[10px] uppercase transition-all"
            style={{
              background: filter === f ? "#1a1a3e" : "#0d0d24",
              color: filter === f ? "#00ff00" : "#6b7280",
              border: `2px solid ${filter === f ? "#00ff00" : "#1a1a3e"}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="text-center py-16 font-mono text-xs text-gray-600 animate-pulse">LOADING...</div>
      ) : filteredFeedback.length === 0 ? (
        <div
          className="text-center py-16 font-mono text-xs text-gray-600"
          style={{ background: "#0d0d24", border: "3px solid #1a1a3e" }}
        >
          No feedback {filter !== "all" ? `(${filter})` : "yet"}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFeedback.map((item) => (
            <div
              key={item.id}
              className={`p-5 ${!item.is_read ? "border-l-4 border-l-emerald-500" : ""}`}
              style={{
                background: "#0d0d24",
                border: "3px solid #1a1a3e",
                boxShadow: "4px 4px 0px #000",
                opacity: item.is_resolved ? 0.5 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-500/20 flex items-center justify-center flex-shrink-0" style={{ border: "2px solid #1a1a3e" }}>
                    <MessageCircle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-gray-300">{item.user_email || "Anonymous"}</div>
                    <div className="font-mono text-[9px] text-gray-600">
                      {new Date(item.created_at).toLocaleString()}
                      {item.page_url && <span> · {item.page_url}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateFeedback(item.id, { is_starred: !item.is_starred })}
                    className={`p-1.5 transition-colors ${item.is_starred ? "text-amber-400" : "text-gray-600 hover:text-amber-400"}`}
                  >
                    <Star className="w-4 h-4" fill={item.is_starred ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => updateFeedback(item.id, { is_read: !item.is_read })}
                    className={`p-1.5 transition-colors ${item.is_read ? "text-emerald-400" : "text-gray-600 hover:text-emerald-400"}`}
                    title={item.is_read ? "Mark unread" : "Mark read"}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateFeedback(item.id, { is_resolved: !item.is_resolved })}
                    className={`p-1.5 transition-colors ${item.is_resolved ? "text-emerald-400" : "text-gray-600 hover:text-emerald-400"}`}
                    title={item.is_resolved ? "Unresolve" : "Resolve"}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  {item.user_email && (
                    <a
                      href={`mailto:${item.user_email}?subject=Re: Your Rizzly Feedback`}
                      className="p-1.5 text-gray-600 hover:text-cyan-400 transition-colors"
                      title="Reply via email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              <p className="font-mono text-sm text-gray-300 leading-relaxed pl-11">{item.message}</p>
              {item.is_resolved && (
                <span className="inline-block mt-2 ml-11 font-mono text-[9px] px-2 py-0.5 text-emerald-400 uppercase"
                  style={{ background: "rgba(0,255,0,0.1)", border: "1px solid #1a1a3e" }}>
                  RESOLVED
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
