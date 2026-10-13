import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { isAdminRequest } from "@/lib/adminSession";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Directory of registered Channel Partners (with phone numbers), used to
// populate "forward to" / "delegate to" pickers in the admin panel, and the
// "choose your Company CP" picker a Field/Digital CP sees on their own
// dashboard — in the latter case, always scoped to company CPs in their own
// city, never the full directory.
export async function GET(request) {
  try {
    const admin = isAdminRequest(request);
    let ownCity = null;
    if (!admin) {
      const sessionUser = await getSessionUser(request);
      if (
        !sessionUser ||
        sessionUser.accountType !== "freelancer" ||
        !["field", "digital"].includes(sessionUser.cpType)
      ) {
        return NextResponse.json({ success: false, error: "Not authorized" }, { status: 401 });
      }
      ownCity = sessionUser.city || "";
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const cpType = searchParams.get("cpType");

    const query = {
      accountType: "freelancer",
      status: "Active",
      cpApprovalStatus: "active",
    };
    if (admin) {
      if (cpType) query.cpType = cpType;
    } else {
      // Non-admin callers can only ever see company CPs in their own city.
      query.cpType = "company";
      query.city = ownCity;
    }

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
