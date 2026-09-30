import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import { isAdminRequest } from "@/lib/adminSession";

// Admin-panel plan purchase requests — needs visibility into every user's
// purchase requests, gated by the real server-side admin session.

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

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
