import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Webhook secret missing in env");

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Prevent duplicate webhook processing
    // Example: Check if event.payload.payment.entity.order_id is already marked as paid in DB
    
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      console.log(`Payment captured for order: ${payment.order_id}`);
      
      // TODO: Securely update user tokens in DB using payment.order_id to find the transaction
      // e.g. await supabase.rpc('deduct_tokens', { amount: -tokens_purchased }) 
      // (Using a negative amount to add tokens, or a dedicated add_tokens function)
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      console.log(`Payment failed for order: ${payment.order_id}`);
      // TODO: Mark transaction as failed in DB
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
