import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CpLead from "@/models/CpLead";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { isAdminRequest } from "@/lib/adminSession";
import Assignment from "@/models/Assignment";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_PATCHABLE_FIELDS = ["status", "routingStage", "assignedTo", "assignedToAccountId"];

// Service providers have no CP dashboard — they work the same Leads tab as
// owners/brokers. So when a lead is handed to one, mirror it into the Lead
// collection they already read, tagged with who forwarded it.
async function mirrorToOwnedLead(lead, assignedToAccountId, forwardedBy) {
  if (!lead || !assignedToAccountId) return;

  await Lead.findOneAndUpdate(
    { id: `CPL-${lead.id}` },
    {
      $set: {
        name: lead.customer,
        phone: lead.phone || "—", // Lead.phone is required
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
// session of its own. The one exception: the Company CP that currently owns
// a lead may forward it to a service provider (`serviceProviderAccountId`)
// from their own portal — nothing else is patchable by them.
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const existing = await CpLead.findOne({ id }).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    const body = await request.json();
    const isAdmin = isAdminRequest(request);

    if (!isAdmin) {
      const user = await getSessionUser(request);
      const isCompany = user?.accountType === "freelancer" && user.cpType === "company";
      // Owns it directly (Head CP forwarded it) or via a Field/Digital CP it delegated a project to.
      const ownsLead =
        isCompany &&
        ((existing.routingStage === "company-cp" && existing.assignedToAccountId === user.accountId) ||
          !!(await Assignment.exists({
            level: { $in: ["company-to-field", "company-to-digital"] },
            assignedByAccountId: user.accountId,
            assignedToAccountId: existing.submittedBy?.accountId,
          })));
      if (!ownsLead || !body.serviceProviderAccountId) {
        return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
      }
    }

    const update = {};
    if (isAdmin) {
      for (const key of ADMIN_PATCHABLE_FIELDS) {
        if (body[key] !== undefined) update[key] = body[key];
      }
    }

    let provider = null;
    if (body.serviceProviderAccountId) {
      // Resolve from the DB — never trust a client-supplied name / type.
      provider = await User.findOne({
        accountId: body.serviceProviderAccountId,
        accountType: "service-provider",
        status: "Active",
      }).lean();
      if (!provider) {
        return NextResponse.json({ success: false, error: "Service provider not found" }, { status: 404 });
      }
      update.serviceProvider = {
        accountId: provider.accountId,
        name: provider.fullName,
        serviceType: provider.serviceType || "",
        forwardedAt: new Date(),
      };
      update.status = "Assigned";
    }

    const updated = await CpLead.findOneAndUpdate({ id }, { $set: update }, { new: true, runValidators: true }).lean();

    if (provider) {
      await mirrorToOwnedLead(updated, provider.accountId, {
        name: existing.assignedTo,
        accountId: existing.assignedToAccountId,
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/cp-leads/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update lead" },
      { status: 500 }
    );
  }
}
