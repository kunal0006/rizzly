import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required signature fields." },
        { status: 400 }
      );
    }

    // ── 1. Verify HMAC signature ─────────────────────────────────────
    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Signature mismatch. Payment verification failed." },
        { status: 400 }
      );
    }

    // ── 2. Look up the pending transaction ───────────────────────────
    const adminSupabase = createAdminSupabaseClient();
    const { data: transaction, error: txError } = await adminSupabase
      .from("transactions")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("status", "created")
      .single();

    if (txError || !transaction) {
      console.error("Transaction not found or already processed:", txError);
      return NextResponse.json(
        { error: "Transaction not found or already processed." },
        { status: 404 }
      );
    }

    // Guard: only the owning user can verify their own payment
    if (transaction.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── 3. Mark transaction as paid ──────────────────────────────────
    await adminSupabase
      .from("transactions")
      .update({
        status: "paid",
        razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    // ── 4. Add tokens to user ────────────────────────────────────────
    const tokensToAdd = transaction.tokens_added ?? 0;
    if (tokensToAdd > 0) {
      // Try the atomic RPC first; fall back to a read-then-write
      const { error: rpcError } = await adminSupabase.rpc("add_tokens", {
        p_user_id: user.id,
        p_amount: tokensToAdd,
      });

      if (rpcError) {
        console.warn("add_tokens RPC unavailable, using fallback:", rpcError.message);
        // Fallback: fetch current balance and increment directly
        const { data: currentUser } = await adminSupabase
          .from("users")
          .select("token_balance")
          .eq("id", user.id)
          .single();

        const newBalance = (currentUser?.token_balance ?? 0) + tokensToAdd;
        await adminSupabase
          .from("users")
          .update({ token_balance: newBalance })
          .eq("id", user.id);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified and tokens added.",
        tokensAdded: tokensToAdd,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment." },
      { status: 500 }
    );
  }
}
