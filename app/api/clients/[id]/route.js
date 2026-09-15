import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Client from "@/models/Client";
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

    const existing = await Client.findOne({ id }).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    if (existing.ownerId !== sessionUser.accountId) {
      return NextResponse.json({ success: false, error: "You can only manage your own clients" }, { status: 403 });
    }

    const body = await request.json();
    const set = {};
    if (typeof body.callDone === "boolean") set.callDone = body.callDone;
    if (body.clearNotes === true) {
      set.notes = [];
    } else if (typeof body.note === "string" && body.note.trim()) {
      const existingNotes = Array.isArray(existing.notes) ? existing.notes : [];
      set.notes = [...existingNotes, { text: body.note.trim() }];
    }

    if (Object.keys(set).length === 0) {
      return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
    }

    const updated = await Client.findOneAndUpdate(
      { id },
      { $set: set },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/clients/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update client" },
      { status: 500 }
    );
  }
}
