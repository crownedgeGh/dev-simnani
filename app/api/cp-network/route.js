import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Directory of registered Channel Partners, used to populate "forward to" /
// "delegate to" pickers with real accounts (name + city + state) instead of
// demo data. On hold / suspended CPs are excluded — they shouldn't receive
// new work while blocked from the portal.
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const cpType = searchParams.get("cpType");

    const query = {
      accountType: "freelancer",
      status: "Active",
      cpApprovalStatus: "active",
    };
    if (cpType) query.cpType = cpType;

    const users = await User.find(query)
      .select("accountId fullName mobile city state cpType")
      .sort({ fullName: 1 })
      .lean();

    const data = users.map((u) => ({
      accountId: u.accountId,
      id: u.accountId,
      name: u.fullName,
      fullName: u.fullName,
      mobile: u.mobile,
      city: u.city || "",
      state: u.state || "",
      cpType: u.cpType,
    }));

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET /api/cp-network error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch CP network" },
      { status: 500 }
    );
  }
}
