import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

// Maps plan/pack IDs to the number of tokens they grant
const PLAN_TOKEN_MAP: Record<string, number> = {
  pack_50: 50,
  pack_150: 150,
  pack_500: 500,
  sub_scout: 100,
  sub_alpha: 400,
  sub_grizzly: 1200,
  sub_ultra_pro: 9999, // Represents "unlimited"
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
    const { amount, receipt, planId } = body;

    // Validate minimum amount (100 paise = 1 INR)
    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum amount is 100 paise." },
        { status: 400 }
      );
    }

    const options = {
      amount: amount, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Persist the order to the transactions table so we can fulfil tokens on payment
    const tokensToAdd = planId ? (PLAN_TOKEN_MAP[planId] ?? 0) : 0;
    const adminSupabase = createAdminSupabaseClient();
    const { error: insertError } = await adminSupabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount_inr: amount / 100, // convert paise → INR
        tokens_added: tokensToAdd,
        razorpay_order_id: order.id,
        status: "created",
      });

    if (insertError) {
      // Non-fatal: log but still return the order so the user can pay
      console.error("Failed to persist transaction record:", insertError);
    }

    return NextResponse.json({ ...order, tokens_to_add: tokensToAdd }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    if (error?.statusCode === 401) {
      return NextResponse.json(
        { error: "Razorpay Authentication Failed. Check your API keys." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: error?.error?.description || error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
