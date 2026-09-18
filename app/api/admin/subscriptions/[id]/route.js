import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { getPlanById } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

const ALLOWED_STATUSES = ["Approved", "Hold", "Rejected", "Pending"];

// PATCH /api/admin/subscriptions/[id] — admin decision: Approve / Hold / Reject.
// Approving syncs the plan onto the user's account (limit + expiry);
// Hold/Reject flip the user's planStatus so gated actions can react, but
// leave their last-known plan fields alone for reference.
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return NextResponse.json({ success: false, error: "Subscription not found" }, { status: 404 });
    }

    subscription.status = body.status;
    subscription.decidedAt = new Date();
    if (typeof body.adminNote === "string") subscription.adminNote = body.adminNote;

    const plan = getPlanById(subscription.plan);

    if (body.status === "Approved") {
      const expiresAt =
        plan?.validityMonths ? addMonths(new Date(), plan.validityMonths) : null;
      subscription.expiresAt = expiresAt;
      await subscription.save();

      const updatedUser = await User.findOneAndUpdate(
        { accountId: subscription.accountId },
        {
          $set: {
            plan: subscription.plan,
            planStatus: "active",
            planPropertyLimit: subscription.propertyLimit ?? plan?.propertyLimit ?? null,
            planExpiresAt: expiresAt,
            planSubscriptionId: String(subscription._id),
          },
        },
        { new: true, runValidators: true }
      ).lean();

      return NextResponse.json({ success: true, data: { subscription, user: updatedUser } });
    }

    await subscription.save();

    const planStatus = body.status === "Hold" ? "hold" : body.status === "Rejected" ? "rejected" : "pending";
    const updatedUser = await User.findOneAndUpdate(
      { accountId: subscription.accountId, planSubscriptionId: String(subscription._id) },
      { $set: { planStatus } },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ success: true, data: { subscription, user: updatedUser } });
  } catch (error) {
    console.error("PATCH /api/admin/subscriptions/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update subscription" },
      { status: 500 }
    );
  }
}
