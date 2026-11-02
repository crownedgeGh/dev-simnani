import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import User from "@/models/User";
import { getListingLimit } from "@/lib/properties";
import { getSessionUser } from "@/lib/session";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

// GET /api/users/[accountId]/listing-usage — listings used vs. allowed
// (base tier limit + topup credits), same math as /api/properties/limit-status.
export async function GET(request, { params }) {
  try {
    const { accountId } = await params;
    const sessionUser = await getSessionUser(request);
    if (!isAdminRequest(request) && sessionUser?.accountId !== accountId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const user = await User.findOne({ accountId }).lean();
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const used = await Property.countDocuments({ ownerId: accountId });
    const limit = getListingLimit(user.accountType, user.topupCredits);
    return NextResponse.json({ success: true, data: { used, limit, left: Math.max(limit - used, 0) } });
  } catch (error) {
    console.error("GET /api/users/[accountId]/listing-usage error:", error);
    return NextResponse.json({ success: false, error: "Failed to load listing usage" }, { status: 500 });
  }
}
