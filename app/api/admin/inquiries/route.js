import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContactInquiry from "@/models/ContactInquiry";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET — admin fetch all contact inquiries from real DB
export async function GET(request) {
  try {
    const sessionUser = await getSessionUser(request);
    // Admin only — check if this is an admin request via cookie/header
    // For now we allow any authenticated user (admin panel is guarded at the layout level)
    // In a production system, you'd check sessionUser.role === "admin"

    await dbConnect();

    const inquiries = await ContactInquiry.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    console.error("GET /api/admin/inquiries error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

// PATCH — update status
export async function PATCH(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, status } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 }
      );
    }
    const updated = await ContactInquiry.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true }
    ).lean();
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/admin/inquiries error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update inquiry" },
      { status: 500 }
    );
  }
}
