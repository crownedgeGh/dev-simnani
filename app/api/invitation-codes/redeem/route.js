import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InvitationCode from "@/models/InvitationCode";
import User from "@/models/User";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Redeems the code Head CP sent to this specific Company CP and unlocks
// their portal (Task 2 / Task 3) — a code only works for the account it was
// generated for, and only once.
export async function POST(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const code = (body.code || "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ success: false, error: "Enter the invitation code" }, { status: 400 });
    }

    const invitationCode = await InvitationCode.findOne({
      code,
      targetAccountId: user.accountId,
      used: false,
    });

    if (!invitationCode) {
      return NextResponse.json({ success: false, error: "Invalid or already used invitation code" }, { status: 404 });
    }

    invitationCode.used = true;
    invitationCode.usedBy = user.accountId;
    invitationCode.usedAt = new Date();
    await invitationCode.save();

    await User.findOneAndUpdate({ accountId: user.accountId }, { $set: { cpPortalLocked: false } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/invitation-codes/redeem error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to redeem invitation code" },
      { status: 500 }
    );
  }
}
