import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import { hashPassword } from "@/lib/password";
import { SESSION_MAX_AGE, setSessionCookie } from "@/lib/session";
import { isPasswordValid } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { mobile, password, confirmPassword, checkOnly } = body;

    const digits = (mobile || "").replace(/\D/g, "").slice(-10);

    if (digits.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    const users = await User.find({}).select("+password");
    const user = users.find((u) => (u.mobile || "").replace(/\D/g, "").slice(-10) === digits);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "No account found with this mobile number. Please check the number or register.",
        },
        { status: 404 }
      );
    }

    // If client just wants to verify the mobile number before triggering OTP
    if (checkOnly) {
      return NextResponse.json({
        success: true,
        message: "Account verified. Proceed with OTP.",
      });
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Enter a new password" },
        { status: 400 }
      );
    }

    if (!isPasswordValid(password)) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Hash and update password in database
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    await user.save();

    // Create session so the user is immediately authenticated
    const token = crypto.randomBytes(32).toString("hex");
    await Session.create({
      token,
      accountId: user.accountId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    });

    const { password: _p, ...safeUser } = user.toObject();
    const res = NextResponse.json({
      success: true,
      message: "Password updated successfully in database",
      data: safeUser,
    });

    setSessionCookie(res, token);
    return res;
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
