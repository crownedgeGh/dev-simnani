import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TopupPurchase from "@/models/TopupPurchase";
import { getSessionUser } from "@/lib/session";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function canAccessAccount(request, accountId) {
  if (isAdminRequest(request)) return true;
  const sessionUser = await getSessionUser(request);
  return !!sessionUser && sessionUser.accountId === accountId;
}

// GET /api/users/[accountId]/topups — purchase history for the topup
// credits shown on User.topupCredits (see models/TopupPurchase.js).
export async function GET(request, { params }) {
  try {
    const { accountId } = await params;
    if (!(await canAccessAccount(request, accountId))) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const docs = await TopupPurchase.find({ accountId }).sort({ createdAt: -1 }).lean();
    const data = docs.map((d) => ({ ...d, _id: d._id.toString() }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/users/[accountId]/topups error:", error);
    return NextResponse.json({ success: false, error: "Failed to load topup history" }, { status: 500 });
  }
}
