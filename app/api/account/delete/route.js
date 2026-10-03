import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import { getSessionUser, clearSessionCookie } from "@/lib/session";
import { verifyPassword } from "@/lib/password";
import { verifyOtp } from "@/lib/otp";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Self-service account deletion, gated by re-proving identity via password
// or OTP (mirrors the login-password / login-otp verification already used
// elsewhere). Soft-deletes by flipping status to "Deleted" — same field the
// admin "Soft Delete" action in /admin/users uses — so the record (and an
// admin's "Undelete" option) is preserved rather than hard-removed.
export async function POST(request) {
  try {
    if (isRateLimited(request, { limit: 5, windowMs: 10 * 60 * 1000, key: "delete-account" })) {
      return rateLimitResponse();
    }

    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { method, password, otp } = await request.json();
    const digits = (sessionUser.mobile || "").replace(/\D/g, "").slice(-10);

    await dbConnect();

    if (method === "password") {
      if (!password) {
        return NextResponse.json({ success: false, error: "Enter your password" }, { status: 400 });
      }
      const full = await User.findOne({ accountId: sessionUser.accountId }).select("+password").lean();
      if (!full?.password) {
        return NextResponse.json(
          { success: false, error: "No password set for this account. Please verify with OTP instead." },
          { status: 400 }
        );
      }
      if (!(await verifyPassword(password, full.password))) {
        return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
      }
    } else if (method === "otp") {
      if (!otp) {
        return NextResponse.json({ success: false, error: "Enter the OTP sent to your mobile" }, { status: 400 });
      }
      const verification = await verifyOtp(digits, "delete-account", otp);
      if (!verification.valid) {
        return NextResponse.json({ success: false, error: verification.error }, { status: 401 });
      }
    } else {
      return NextResponse.json({ success: false, error: "Invalid verification method" }, { status: 400 });
    }

    await User.findOneAndUpdate({ accountId: sessionUser.accountId }, { $set: { status: "Deleted" } });
    await Session.deleteMany({ accountId: sessionUser.accountId });

    const res = NextResponse.json({ success: true, message: "Account deleted" });
    clearSessionCookie(res);
    return res;
  } catch (error) {
    console.error("POST /api/account/delete error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
