import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InvitationCode from "@/models/InvitationCode";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Lets a locked-out Company CP see the invitation code Head CP sent them
// (Task 3) — scoped to their own accountId only, no admin session needed.
export async function GET(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const invitationCode = await InvitationCode.findOne({
      targetAccountId: user.accountId,
      used: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: invitationCode || null });
  } catch (error) {
    console.error("GET /api/invitation-codes/mine error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch invitation code" },
      { status: 500 }
    );
  }
}
