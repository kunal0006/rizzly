import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Use the dedicated webhook secret; fall back to key secret if not set
    const secret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error("Webhook secret missing in env");
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const adminSupabase = createAdminSupabaseClient();

    // ── payment.captured ──────────────────────────────────────────────
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId: string = payment.order_id;

      console.log(`[Webhook] payment.captured for order: ${orderId}`);

      // Find the pending transaction
      const { data: transaction } = await adminSupabase
        .from("transactions")
        .select("*")
        .eq("razorpay_order_id", orderId)
        .single();

      if (!transaction) {
        // Order might have been created outside our system — log and ignore
        console.warn(`[Webhook] No transaction found for order ${orderId}`);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Idempotency guard: skip if already marked paid
      if (transaction.status === "paid") {
        console.log(`[Webhook] Order ${orderId} already paid, skipping.`);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // Mark as paid
      await adminSupabase
        .from("transactions")
        .update({
          status: "paid",
          razorpay_payment_id: payment.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      // Add tokens
      const tokensToAdd: number = transaction.tokens_added ?? 0;
      if (tokensToAdd > 0) {
        const { error: rpcError } = await adminSupabase.rpc("add_tokens", {
          p_user_id: transaction.user_id,
          p_amount: tokensToAdd,
        });

        if (rpcError) {
          console.warn("[Webhook] add_tokens RPC failed, using fallback:", rpcError.message);
          const { data: currentUser } = await adminSupabase
            .from("users")
            .select("token_balance")
            .eq("id", transaction.user_id)
            .single();

          const newBalance = (currentUser?.token_balance ?? 0) + tokensToAdd;
          await adminSupabase
            .from("users")
            .update({ token_balance: newBalance })
            .eq("id", transaction.user_id);
        }

        console.log(
          `[Webhook] Added ${tokensToAdd} tokens to user ${transaction.user_id}`
        );
      }
    }

    // ── payment.failed ────────────────────────────────────────────────
    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const orderId: string = payment.order_id;

      console.log(`[Webhook] payment.failed for order: ${orderId}`);

      await adminSupabase
        .from("transactions")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", orderId)
        .eq("status", "created");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
