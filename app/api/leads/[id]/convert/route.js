import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Client from "@/models/Client";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const lead = await Lead.findOne({ id }).lean();
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    if (lead.ownerId !== sessionUser.accountId) {
      return NextResponse.json({ success: false, error: "You can only manage your own leads" }, { status: 403 });
    }

    const client = await Client.create({
      id: `CL-${Math.floor(100000 + Math.random() * 900000)}`,
      name: lead.name,
      phone: lead.phone,
      address: lead.address,
      property: lead.interest,
      propertyId: lead.propertyId || "",
      ownerId: lead.ownerId,
      notes: Array.isArray(lead.notes) ? lead.notes : [],
      callDone: Boolean(lead.callDone),
    });

    await Lead.deleteOne({ id });

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error("POST /api/leads/[id]/convert error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to convert lead" },
      { status: 500 }
    );
  }
}
