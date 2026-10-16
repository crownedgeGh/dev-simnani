import { NextResponse } from "next/server";
import crypto from "crypto";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST — verify the signature Razorpay returns after checkout completes
export async function POST(request) {
  try {
    if (isRateLimited(request, { limit: 20, windowMs: 10 * 60 * 1000, key: "payments-verify" })) {
      return rateLimitResponse();
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: "Missing payment details" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const verified = expected === razorpay_signature;

    return NextResponse.json({ success: verified }, { status: verified ? 200 : 400 });
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ success: false, error: "Could not verify payment" }, { status: 500 });
  }
}
