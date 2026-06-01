"use client";

import { useState, useEffect } from "react";
import { CreditCard, Save, Loader2, Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  tokens: string;
  price: number;
  visible: boolean;
  popular?: boolean;
  features: string[];
}

export default function PricingManagerPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config?key=pricing_plans")
      .then((r) => r.json())
      .then((data) => {
        if (data.config?.value) {
          try {
            const parsed = typeof data.config.value === 'string' 
              ? JSON.parse(data.config.value) 
              : data.config.value;
            setPlans(parsed);
          } catch (e) {
            console.error("Failed to parse config:", e);
          }
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
        body: JSON.stringify({ key: "pricing_plans", value: plans }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save");
    }
    setSaving(false);
  };

  const updatePlan = (index: number, updates: Partial<PricingPlan>) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], ...updates };
    setPlans(updated);
  };

  const addPlan = () => {
    setPlans([
      ...plans,
      {
        id: `plan_${Date.now()}`,
        name: "NEW PLAN",
        tokens: "0/mo",
        price: 0,
        visible: true,
        features: ["Feature 1"],
      },
    ]);
  };

  const removePlan = (index: number) => {
    if (confirm("Delete this plan?")) {
      setPlans(plans.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-pixel text-xl text-emerald-400 tracking-wider">PRICING</h1>
          <p className="font-mono text-xs text-gray-600 mt-1 uppercase">Manage pricing plans — changes go live instantly</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addPlan}
            className="flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase transition-all hover:translate-y-[-2px]"
            style={{
              background: "#0d0d24",
              color: "#a78bfa",
              border: "3px solid #1a1a3e",
              boxShadow: "4px 4px 0px #000",
            }}
          >
            <Plus className="w-4 h-4" /> ADD PLAN
          </button>
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
      </div>

      {loading ? (
        <div className="text-center py-16 font-mono text-xs text-gray-600 animate-pulse">LOADING PLANS...</div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`p-5 ${!plan.visible ? "opacity-50" : ""}`}
              style={{
                background: "#0d0d24",
                border: "3px solid #1a1a3e",
                boxShadow: "4px 4px 0px #000",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-500/20 flex items-center justify-center" style={{ border: "2px solid #1a1a3e" }}>
                    <CreditCard className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-gray-600">ID: {plan.id}</span>
                    {plan.popular && (
                      <span className="ml-2 font-mono text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-400" style={{ border: "1px solid #1a1a3e" }}>
                        POPULAR
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updatePlan(index, { visible: !plan.visible })}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                    title={plan.visible ? "Hide plan" : "Show plan"}
                  >
                    {plan.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => updatePlan(index, { popular: !plan.popular })}
                    className={`p-2 font-mono text-[9px] transition-colors ${plan.popular ? "text-amber-400" : "text-gray-600 hover:text-amber-400"}`}
                  >
                    ★
                  </button>
                  <button onClick={() => removePlan(index)} className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Plan Name</label>
                  <input
                    value={plan.name}
                    onChange={(e) => updatePlan(index, { name: e.target.value })}
                    className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                    style={{ background: "#080818", border: "2px solid #1a1a3e" }}
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={plan.price}
                    onChange={(e) => updatePlan(index, { price: Number(e.target.value) })}
                    className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                    style={{ background: "#080818", border: "2px solid #1a1a3e" }}
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Tokens</label>
                  <input
                    value={plan.tokens}
                    onChange={(e) => updatePlan(index, { tokens: e.target.value })}
                    className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                    style={{ background: "#080818", border: "2px solid #1a1a3e" }}
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-gray-600 uppercase block mb-1">Features (comma-separated)</label>
                  <input
                    value={plan.features.join(", ")}
                    onChange={(e) => updatePlan(index, { features: e.target.value.split(",").map((f) => f.trim()) })}
                    className="w-full px-3 py-2 font-mono text-sm text-white outline-none"
                    style={{ background: "#080818", border: "2px solid #1a1a3e" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
