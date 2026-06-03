import { createClient } from "@/lib/supabase/client";

export type PlanType = "free" | "pro" | "ultra_pro";

export interface UserPlan {
  plan: PlanType;
  freeUsesRemaining: number;
}

/**
 * Get the user's current plan from Supabase.
 * Falls back to localStorage for backward compat & quick checks.
 */
export async function getUserPlan(): Promise<UserPlan> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { plan: "free", freeUsesRemaining: 1 };
    }

    let { data, error } = await supabase
      .from("users")
      .select("plan_type, free_uses_remaining")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      // Row might be missing! Let's trigger sync on the server side
      try {
        const syncRes = await fetch("/api/users/sync", { method: "POST" });
        if (syncRes.ok) {
          const { data: retryData } = await supabase
            .from("users")
            .select("plan_type, free_uses_remaining")
            .eq("id", user.id)
            .single();
          if (retryData) {
            data = retryData;
          }
        }
      } catch (syncErr) {
        console.error("getUserPlan: error during auto-sync:", syncErr);
      }
    }

    if (data) {
      // Sync to localStorage for fast client-side checks
      if (typeof window !== "undefined") {
        localStorage.setItem("rizzly_plan", data.plan_type || "free");
      }
      return {
        plan: (data.plan_type || "free") as PlanType,
        freeUsesRemaining: data.free_uses_remaining ?? 1,
      };
    }
  } catch {
    // Fall through to localStorage
  }

  // Fallback: localStorage
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("rizzly_plan");
    if (stored === "ultra_pro") return { plan: "ultra_pro", freeUsesRemaining: 999 };
    if (stored === "pro") return { plan: "pro", freeUsesRemaining: 999 };
  }

  return { plan: "free", freeUsesRemaining: 1 };
}

/**
 * Decrement a free use for a given user. Returns false if no uses remain.
 */
export async function consumeFreeUse(feature?: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    let { data, error: selectError } = await supabase
      .from("users")
      .select("free_uses_remaining, plan_type")
      .eq("id", user.id)
      .single();

    if (selectError || !data) {
      // Auto-sync if record is missing
      try {
        const syncRes = await fetch("/api/users/sync", { method: "POST" });
        if (syncRes.ok) {
          const { data: retryData } = await supabase
            .from("users")
            .select("free_uses_remaining, plan_type")
            .eq("id", user.id)
            .single();
          if (retryData) {
            data = retryData;
          }
        }
      } catch (syncErr) {
        console.error("consumeFreeUse: auto-sync error:", syncErr);
      }
    }

    if (!data) {
      console.error("consumeFreeUse: failed to fetch user data after sync");
      return false;
    }

    const isUltraProReq = feature ? isUltraProFeature(feature) : false;

    // Paid users have unlimited uses, subject to feature tier
    if (data.plan_type === "ultra_pro") return true;
    if (data.plan_type === "pro" && !isUltraProReq) return true;

    const uses = data.free_uses_remaining ?? 1;
    if (uses <= 0) return false;

    const { error: updateError } = await supabase
      .from("users")
      .update({ free_uses_remaining: uses - 1 })
      .eq("id", user.id);

    if (updateError) {
      console.error("consumeFreeUse: failed to update free_uses_remaining", updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error("consumeFreeUse: unexpected error", err);
    return false;
  }
}


/**
 * Check if a feature requires Ultra Pro specifically.
 */
export function isUltraProFeature(feature: string): boolean {
  const ultraProFeatures = ["profile-analyzer"];
  return ultraProFeatures.includes(feature);
}
