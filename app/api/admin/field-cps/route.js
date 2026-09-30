import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import SiteVisit from "@/models/SiteVisit";
import { isAdminRequest } from "@/lib/adminSession";

// Real registered Field CP accounts, for the admin Field CP Management
// page's Network tab — unlike the rest of the CP Network/Leads/Commissions
// section (see lib/adminStorage.js), Field CP partners are real Mongo
// `User` documents (cpType: "field"), so this reads straight from the same
// collection the portal login/session flow uses.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();

    const [users, visitCounts] = await Promise.all([
      User.find({ accountType: "freelancer", cpType: "field" }).sort({ createdAt: -1 }).lean(),
      SiteVisit.aggregate([{ $group: { _id: "$fieldCpAccountId", count: { $sum: 1 } } }]),
    ]);
    const visitCountByAccount = new Map(visitCounts.map((v) => [v._id, v.count]));

    const data = users.map((u) => ({
      id: u.accountId,
      accountId: u.accountId,
      name: u.fullName,
      phone: u.mobile,
      email: u.email || "",
      city: u.city || "",
      state: u.state || "",
      leadsSubmitted: 0,
      siteVisits: visitCountByAccount.get(u.accountId) || 0,
      dealsClosed: u.dealsClosed || 0,
      status: u.status === "Suspended" ? "Suspended" : "Active",
      registeredDate: u.registeredDate || "",
    }));

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET /api/admin/field-cps error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch Field CP partners" },
      { status: 500 }
    );
  }
}
