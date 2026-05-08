import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, receipt } = body;

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

    return NextResponse.json(order, { status: 200 });
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
