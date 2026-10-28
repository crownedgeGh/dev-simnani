import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionUser } from "@/lib/session";
import { getServicePlanById } from "@/lib/servicePlans";
import { backfillLeadsForProvider } from "@/lib/contractorLeadRouting";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// POST /api/service-plans — activate a lead plan after a verified
// Razorpay payment. Re-verifies the signature server-side, same as
// /api/topup — never trust the client's "payment succeeded" callback.
export async function POST(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }
    if (sessionUser.accountType !== "service-provider") {
      return NextResponse.json(
        { success: false, error: "Lead plans are only available for Service Provider accounts" },
        { status: 403 }
      );
    }

    const { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    const plan = getServicePlanById(planId);
    if (!plan) {
      return NextResponse.json({ success: false, error: "Invalid plan selected" }, { status: 400 });
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
      {
        $set: {
          servicePlan: plan.id,
          servicePlanExpiresAt: addMonths(new Date(), plan.validityMonths),
          servicePlanPaymentId: razorpay_payment_id,
        },
      },
      { new: true, runValidators: true }
    ).lean();

    // Backfill: any past callback requests in this provider's own city/state
    // (same trade) that arrived before they subscribed should show up now.
    await backfillLeadsForProvider({
      accountId: updatedUser.accountId,
      city: updatedUser.city,
      state: updatedUser.state,
      serviceType: updatedUser.serviceType,
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("POST /api/service-plans error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to activate plan" },
      { status: 500 }
    );
  }
}
