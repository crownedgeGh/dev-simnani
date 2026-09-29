import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

// Sends a login OTP to the given mobile number via the SMS gateway. Only
// registered mobile numbers get an OTP here — this route is login-only, so
// an unrecognised number should be sent to sign up instead of burning an SMS.
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

    const users = await User.find({}).select("mobile").lean();
    const isRegistered = users.some(
      (u) => (u.mobile || "").replace(/\D/g, "").slice(-10) === digits
    );
    if (!isRegistered) {
      return NextResponse.json(
        {
          success: false,
          notRegistered: true,
          error: "This mobile number is not registered. Please sign up to continue.",
        },
        { status: 404 }
      );
    }

    await sendOtp(digits, "login");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/send-otp error:", error?.response?.data || error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
