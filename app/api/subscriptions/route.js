import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import { getSessionUser } from "@/lib/session";
import { PLANS, getPlanById } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// GET /api/subscriptions — the logged-in user's own purchase history,
// most recent first. Used by /pricing to show current membership status.
export async function GET(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }

    await dbConnect();
    const subscriptions = await Subscription.find({ accountId: sessionUser.accountId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error("GET /api/subscriptions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions — purchase a plan. No payment is collected yet
// (testing period): every plan purchase is auto-approved immediately so
// the broker gets full access right away. An admin can still Hold or
// Reject an existing subscription from /admin/plans.
export async function POST(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }
    if (sessionUser.accountType !== "broker") {
      return NextResponse.json(
        { success: false, error: "Membership plans are only available for Broker accounts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const plan = getPlanById(body.plan);
    if (!plan) {
      return NextResponse.json({ success: false, error: "Invalid plan selected" }, { status: 400 });
    }

    // Block downgrades: once a plan is active or pending approval, only
    // same-or-higher tier plans can be purchased (mirrors /pricing's UI).
    if (sessionUser.planStatus === "active" || sessionUser.planStatus === "pending") {
      const currentRank = PLANS.findIndex((p) => p.id === sessionUser.plan);
      const targetRank = PLANS.findIndex((p) => p.id === plan.id);
      if (currentRank > -1 && targetRank < currentRank) {
        return NextResponse.json(
          { success: false, error: "You cannot downgrade from your current plan" },
          { status: 400 }
        );
      }
    }

    await dbConnect();

    const status = "Approved";
    const expiresAt = !plan.validityMonths ? null : addMonths(new Date(), plan.validityMonths);

    const subscription = await Subscription.create({
      accountId: sessionUser.accountId,
      fullName: sessionUser.fullName,
      mobile: sessionUser.mobile,
      email: sessionUser.email,
      plan: plan.id,
      amount: plan.price,
      propertyLimit: plan.propertyLimit,
      validityMonths: plan.validityMonths,
      status,
      expiresAt,
      decidedAt: new Date(),
    });

    const updatedUser = await User.findOneAndUpdate(
      { accountId: sessionUser.accountId },
      {
        $set: {
          plan: plan.id,
          planStatus: "active",
          planPropertyLimit: plan.propertyLimit,
          planExpiresAt: expiresAt,
          planSubscriptionId: String(subscription._id),
        },
      },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json(
      { success: true, data: { subscription, user: updatedUser } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/subscriptions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to purchase plan" },
      { status: 500 }
    );
  }
}
