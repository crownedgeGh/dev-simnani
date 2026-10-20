import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionUser } from "@/lib/session";
import { getTopupById } from "@/lib/topups";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST /api/topup — credit extra listings after a verified Razorpay
// payment. Re-verifies the signature server-side (never trust the
// client's "payment succeeded" callback for anything that grants credit).
export async function POST(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }

    const { topupId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    const topup = getTopupById(topupId);
    if (!topup) {
      return NextResponse.json({ success: false, error: "Invalid top-up package" }, { status: 400 });
    }
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: "Missing payment details" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expected !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Payment could not be verified" }, { status: 400 });
    }

    await dbConnect();
    const updatedUser = await User.findOneAndUpdate(
      { accountId: sessionUser.accountId },
      { $inc: { topupCredits: topup.listings } },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ success: true, data: { topupCredits: updatedUser.topupCredits } });
  } catch (error) {
    console.error("POST /api/topup error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to credit top-up" }, { status: 500 });
  }
}
