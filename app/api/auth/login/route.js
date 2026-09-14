import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import { generateAccountId } from "@/lib/auth";
import { SESSION_MAX_AGE, setSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

// Mobile + OTP login. OTP delivery/verification is mocked (no SMS gateway),
// but the resulting session is a real DB-backed record — matches the
// existing find-or-create behaviour that used to live in localStorage.
export async function POST(request) {
  try {
    await dbConnect();
    const { mobile } = await request.json();
    const digits = (mobile || "").replace(/\D/g, "").slice(-10);

    if (digits.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    const users = await User.find({}).lean();
    let user = users.find((u) => (u.mobile || "").replace(/\D/g, "").slice(-10) === digits);

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
