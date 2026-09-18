import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

// Admin-panel plan purchase requests. Like /api/admin/properties, this is
// not gated by the buyer/broker session cookie — the admin panel has its
// own (client-side) auth gate (see AdminGuard) and needs visibility into
// every user's purchase requests, not just the caller's own.

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const plan = searchParams.get("plan");

    const query = {};
    if (status && status !== "all") query.status = status;
    if (plan && plan !== "all") query.plan = plan;

    const subscriptions = await Subscription.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error) {
    console.error("GET /api/admin/subscriptions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
