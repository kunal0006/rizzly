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

    // Distinguish a DB/network error from a genuine "not found / already paid"
    if (txError) {
      if (txError.code === "PGRST116") {
        // PostgREST "no rows" code — order unknown or already processed
        return NextResponse.json(
          { error: "Transaction not found or already processed." },
          { status: 404 }
        );
      }
      // Any other code is a real DB error — don't pretend the order is unknown
      console.error("DB error looking up transaction:", txError);
      return NextResponse.json(
        { error: "Failed to look up transaction. Please try again." },
        { status: 500 }
      );
    }

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found or already processed." },
        { status: 404 }
      );
    }

    // Guard: only the owning user can verify their own payment
    if (transaction.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── 3. Atomic fulfillment: mark paid + add tokens in one RPC ─────
    // The `fulfill_payment` RPC does both inside a single DB transaction,
    // so there is no window where the order is "paid" but tokens aren't added.
    const tokensToAdd = transaction.tokens_added ?? 0;
    const { error: fulfillError } = await adminSupabase.rpc("fulfill_payment", {
      p_transaction_id: transaction.id,
      p_payment_id: razorpay_payment_id,
      p_user_id: user.id,
      p_tokens: tokensToAdd,
    });

    if (fulfillError) {
      console.error("fulfill_payment RPC failed:", fulfillError.message);
      return NextResponse.json(
        { error: "Payment was verified but fulfillment failed. Contact support." },
        { status: 500 }
      );
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
