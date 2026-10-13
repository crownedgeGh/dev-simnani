import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CpLead from "@/models/CpLead";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_PATCHABLE_FIELDS = ["status", "routingStage", "assignedTo", "assignedToAccountId"];

// Service providers have no CP dashboard — they work the same Leads tab as
// owners/brokers. So when a lead is handed to one, mirror it into the Lead
// collection they already read, tagged with who forwarded it.
async function mirrorToOwnedLead(lead, assignedToAccountId, forwardedBy) {
  if (!lead || !assignedToAccountId) return;

  const target = await User.findOne({ accountId: assignedToAccountId, accountType: "service-provider" }).lean();
  if (!target) return;

  await Lead.findOneAndUpdate(
    { id: `CPL-${lead.id}` },
    {
      $set: {
        name: lead.customer,
        phone: lead.phone || "",
        propertyId: lead.projectId || "",
        interest: lead.project || "",
        ownerId: assignedToAccountId,
        source: "Company CP",
        forwardedBy: { cpType: "company", name: forwardedBy?.name || "Company CP", accountId: forwardedBy?.accountId || "" },
      },
      $setOnInsert: { id: `CPL-${lead.id}` },
    },
    { upsert: true, runValidators: true }
  );
}

// The admin panel drives the routing pipeline (status changes, forward to
// Company CP, delegate to Field/Digital CP) — trusted the same way
// /api/assignments' head-to-company leg is, since the admin panel has no
// session of its own.
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const existing = await CpLead.findOne({ id }).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    const body = await request.json();
    const update = {};
    for (const key of ADMIN_PATCHABLE_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const updated = await CpLead.findOneAndUpdate({ id }, { $set: update }, { new: true, runValidators: true }).lean();

    // `existing` still holds the Company CP the lead sat with before this hand-off.
    await mirrorToOwnedLead(updated, update.assignedToAccountId, {
      name: existing.assignedTo,
      accountId: existing.assignedToAccountId,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/cp-leads/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update lead" },
      { status: 500 }
    );
  }
}
