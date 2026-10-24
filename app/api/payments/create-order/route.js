import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST — create a Razorpay order for the given amount (in rupees)
export async function POST(request) {
  try {
    if (isRateLimited(request, { limit: 20, windowMs: 10 * 60 * 1000, key: "payments-create-order" })) {
      return rateLimitResponse();
    }

    const { amount, notes } = await request.json();
    const rupees = Number(amount);

    if (!rupees || rupees <= 0) {
      return NextResponse.json({ success: false, error: "A valid amount is required" }, { status: 400 });
    }

    const order = await getRazorpay().orders.create({
      amount: Math.round(rupees * 100), // paise
      currency: "INR",
      receipt: `SE-${Date.now()}`,
      notes: notes || {},
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const reason = error?.error?.description || error?.message || "Unknown error";
    console.error("Razorpay create-order error:", reason, error);
    return NextResponse.json({ success: false, error: `Could not create payment order: ${reason}` }, { status: 500 });
  }
}
