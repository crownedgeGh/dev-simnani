import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Admin-only client list for a given owner — powers the read-only portal
// view at /admin/freelancer-cp/contractor/[accountId].
export async function GET(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    const ownerId = new URL(request.url).searchParams.get("ownerId");
    if (!ownerId) {
      return NextResponse.json({ success: false, error: "ownerId is required" }, { status: 400 });
    }

    await dbConnect();
    const clients = await Client.find({ ownerId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
