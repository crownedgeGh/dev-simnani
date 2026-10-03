import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";
import { isMobileValid } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Standalone OTP check — no session/login created. Used to confirm mobile
// ownership during registration, before any account exists to log into.
export async function POST(request) {
  try {
    if (isRateLimited(request, { limit: 10, windowMs: 10 * 60 * 1000, key: "verify-otp" })) {
      return rateLimitResponse();
    }

    const { mobile, otp, purpose = "register" } = await request.json();
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

    const verification = await verifyOtp(digits, purpose, otp);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/verify-otp error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
