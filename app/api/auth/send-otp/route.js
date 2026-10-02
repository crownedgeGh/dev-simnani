import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendOtp } from "@/lib/otp";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";
import { isMobileValid } from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

// Sends a login OTP to the given mobile number via the SMS gateway. Only
// registered mobile numbers get an OTP here — this route is login-only, so
// an unrecognised number should be sent to sign up instead of burning an SMS.
export async function POST(request) {
  try {
    if (isRateLimited(request, { limit: 5, windowMs: 10 * 60 * 1000, key: "send-otp" })) {
      return rateLimitResponse();
    }

    await dbConnect();
    const { mobile, turnstileToken } = await request.json();

    if (!(await verifyTurnstile(turnstileToken, request))) {
      return NextResponse.json(
        { success: false, error: "Verification failed. Please try again." },
        { status: 400 }
      );
    }

    const digits = (mobile || "").replace(/\D/g, "").slice(-10);

    if (!isMobileValid(digits)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    const mobileRegex = new RegExp(digits.split("").join("\\D*") + "$");
    const isRegistered = await User.exists({ mobile: mobileRegex });
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
