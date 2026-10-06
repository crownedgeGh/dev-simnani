import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import CpLead from "@/models/CpLead";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Real registered Company/Digital CP accounts for the admin CP Management
// Network tab, enriched with lead counts — the Field CP equivalent of this
// lives at /api/admin/field-cps (site visits instead of leads).
export async function GET(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const cpType = searchParams.get("cpType");
    if (!cpType || !["company", "digital"].includes(cpType)) {
      return NextResponse.json({ success: false, error: "cpType must be 'company' or 'digital'" }, { status: 400 });
    }

    const [users, leadCounts] = await Promise.all([
      User.find({ accountType: "freelancer", cpType }).sort({ createdAt: -1 }).lean(),
      CpLead.aggregate([
        { $match: { "submittedBy.cpType": cpType } },
        { $group: { _id: "$submittedBy.accountId", count: { $sum: 1 } } },
      ]),
    ]);
    const leadCountByAccount = new Map(leadCounts.map((l) => [l._id, l.count]));

    const data = users.map((u) => ({
      id: u.accountId,
      accountId: u.accountId,
      name: u.fullName,
      phone: u.mobile,
      email: u.email || "",
      city: u.city || "",
      state: u.state || "",
      cpType: u.cpType,
      cpPortalLocked: !!u.cpPortalLocked,
      leadsSubmitted: leadCountByAccount.get(u.accountId) || 0,
      siteVisits: 0,
      dealsClosed: u.dealsClosed || 0,
      status: u.status === "Suspended" ? "Suspended" : "Active",
      registeredDate: u.registeredDate || "",
    }));

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET /api/admin/cp-network error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch CP network" },
      { status: 500 }
    );
  }
}
