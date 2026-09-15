import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(request, { params }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const existing = await Lead.findOne({ id }).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    if (existing.ownerId !== sessionUser.accountId) {
      return NextResponse.json({ success: false, error: "You can only manage your own leads" }, { status: 403 });
    }

    const body = await request.json();
    const set = {};
    if (typeof body.callDone === "boolean") set.callDone = body.callDone;
    if (typeof body.note === "string" && body.note.trim()) {
      const existingNotes = Array.isArray(existing.notes) ? existing.notes : [];
      set.notes = [...existingNotes, { text: body.note.trim() }];
    }
    if (body.clearNotes === true) {
      set.notes = [];
    }

    const updated = await Lead.findOneAndUpdate({ id }, { $set: set }, { new: true, runValidators: true }).lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/leads/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update lead" },
      { status: 500 }
    );
  }
}
