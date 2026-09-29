import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CpLead from "@/models/CpLead";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_PATCHABLE_FIELDS = ["status", "routingStage", "assignedTo", "assignedToAccountId"];

// Two kinds of PATCH land here:
//  - The admin panel driving the routing pipeline (status changes, forward
//    to Company CP, delegate to Field/Digital CP) — trusted the same way
//    /api/assignments' head-to-company leg is, since the admin panel has no
//    session of its own.
//  - The originating Digital/Field CP forwarding their own draft lead to
//    Head CP — requires a session matching submittedBy.accountId.
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const existing = await CpLead.findOne({ id }).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    const body = await request.json();
    const update = {};

    if (body.forward === true) {
      const sessionUser = await getSessionUser(request);
      if (!sessionUser || sessionUser.accountId !== existing.submittedBy?.accountId) {
        return NextResponse.json(
          { success: false, error: "You can only forward your own leads" },
          { status: 403 }
        );
      }
      update.forwarded = true;
      update.routingStage = "head-cp";
    } else {
      for (const key of ADMIN_PATCHABLE_FIELDS) {
        if (body[key] !== undefined) update[key] = body[key];
      }
    }

    const updated = await CpLead.findOneAndUpdate({ id }, { $set: update }, { new: true, runValidators: true }).lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/cp-leads/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update lead" },
      { status: 500 }
    );
  }
}
