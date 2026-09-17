import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import { verifyPassword } from "@/lib/password";
import { SESSION_MAX_AGE, setSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

// Mobile + password login — the alternative to the OTP flow in
// /api/auth/login. Matches by mobile digits the same way the OTP route
// does, then verifies the bcrypt hash stored on the user record.
export async function POST(request) {
  try {
    await dbConnect();
    const { mobile, password } = await request.json();
    const digits = (mobile || "").replace(/\D/g, "").slice(-10);

    if (digits.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { success: false, error: "Enter your password" },
        { status: 400 }
      );
    }

    const users = await User.find({}).select("+password").lean();
    const user = users.find((u) => (u.mobile || "").replace(/\D/g, "").slice(-10) === digits);

    if (!user || !user.password) {
      return NextResponse.json(
        {
          success: false,
          error: "No password set for this account. Please login via OTP instead.",
        },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect mobile number or password" },
        { status: 401 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    await Session.create({
      token,
      accountId: user.accountId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    });

    const { password: _password, ...safeUser } = user;
    const res = NextResponse.json({ success: true, data: safeUser });
    setSessionCookie(res, token);
    return res;
  } catch (error) {
    console.error("POST /api/auth/login-password error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
