import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import { generateAccountId, isMobileValid } from "@/lib/auth";
import { SESSION_MAX_AGE, setSessionCookie } from "@/lib/session";
import { verifyOtp } from "@/lib/otp";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Mobile + OTP login. The OTP is sent by /api/auth/send-otp and verified
// here against the hash stored in the Otp collection; the resulting
// session is a real DB-backed record — matches the existing find-or-create
// behaviour that used to live in localStorage.
export async function POST(request) {
  try {
    if (isRateLimited(request, { limit: 10, windowMs: 10 * 60 * 1000, key: "login-otp" })) {
      return rateLimitResponse();
    }

    await dbConnect();
    const { mobile, otp } = await request.json();
    const digits = (mobile || "").replace(/\D/g, "").slice(-10);

    if (!isMobileValid(digits)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }
    if (!otp) {
      return NextResponse.json(
        { success: false, error: "Enter the OTP sent to your mobile" },
        { status: 400 }
      );
    }

    const verification = await verifyOtp(digits, "login", otp);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 401 }
      );
    }

    const mobileRegex = new RegExp(digits.split("").join("\\D*") + "$");
    let user = await User.findOne({ mobile: mobileRegex }).lean();

    if (!user) {
      const created = await User.create({
        accountId: generateAccountId("IND"),
        fullName: "",
        mobile: digits,
        email: "",
        city: "",
        accountType: "common-person",
      });
      user = created.toObject();
    }

    const token = crypto.randomBytes(32).toString("hex");
    await Session.create({
      token,
      accountId: user.accountId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    });

    const res = NextResponse.json({ success: true, data: user });
    setSessionCookie(res, token);
    return res;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
