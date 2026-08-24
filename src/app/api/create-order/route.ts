import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

// Single source of truth for plan pricing and token allocation.
// Amount is in paise (INR × 100). Client never sends price — server derives it.
const PLAN_CONFIG: Record<string, { amountPaise: number; tokens: number; label: string }> = {
  pack_50:        { amountPaise:  4900, tokens:   50, label: "50 Token Pack" },
  pack_150:       { amountPaise: 12900, tokens:  150, label: "150 Token Pack" },
  pack_500:       { amountPaise: 34900, tokens:  500, label: "500 Token Pack" },
  sub_scout:      { amountPaise:  9900, tokens:  100, label: "Scout Subscription" },
  sub_alpha:      { amountPaise: 29900, tokens:  400, label: "Alpha Subscription" },
  sub_grizzly:    { amountPaise: 69900, tokens: 1200, label: "Grizzly+ Subscription" },
  sub_ultra_pro:  { amountPaise: 199900, tokens: 9999, label: "Ultra Pro Subscription" },
};

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId } = body;

    // Validate plan — price and tokens come from server config, never the client
    const plan = PLAN_CONFIG[planId];
    if (!plan) {
      return NextResponse.json(
        { error: `Invalid plan: "${planId}". Please choose a valid plan.` },
        { status: 400 }
      );
    }

    // Create Razorpay order using server-authoritative amount
    const order = await razorpay.orders.create({
      amount: plan.amountPaise,
      currency: "INR",
      receipt: `${planId}_${Date.now()}`,
    });

    // Persist the transaction BEFORE returning the order.
    // If this fails we must not proceed — we'd have no way to fulfill tokens.
    const adminSupabase = createAdminSupabaseClient();
    const { error: insertError } = await adminSupabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount_inr: plan.amountPaise / 100,
        tokens_added: plan.tokens,
        razorpay_order_id: order.id,
        status: "created",
      });

    if (insertError) {
      console.error("Failed to persist transaction — aborting order:", insertError);
      return NextResponse.json(
        { error: "Failed to record your transaction. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        tokens_to_add: plan.tokens,
        label: plan.label,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    if (error?.statusCode === 401) {
      return NextResponse.json(
        { error: "Razorpay authentication failed. Check your API keys." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error?.error?.description || error.message || "Failed to create order." },
      { status: 500 }
    );
  }
}
