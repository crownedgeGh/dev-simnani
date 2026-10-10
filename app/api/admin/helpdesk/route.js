import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import HelpdeskTicket from "@/models/HelpdeskTicket";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET — admin fetch all helpdesk tickets
export async function GET(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();

    const tickets = await HelpdeskTicket.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error("GET /api/admin/helpdesk error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

// PATCH — update ticket status
export async function PATCH(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();
    const { id, status } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const updated = await HelpdeskTicket.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true }
    ).lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/admin/helpdesk error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update ticket" },
      { status: 500 }
    );
  }
}
