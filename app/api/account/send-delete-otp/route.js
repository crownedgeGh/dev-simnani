import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { sendOtp } from "@/lib/otp";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Sends an OTP to the logged-in user's own mobile number, used to confirm
// account deletion (the password-or-OTP gate on the "Delete Account" flow).
export async function POST(request) {
  try {
    if (isRateLimited(request, { limit: 5, windowMs: 10 * 60 * 1000, key: "send-delete-otp" })) {
      return rateLimitResponse();
    }

    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const digits = (user.mobile || "").replace(/\D/g, "").slice(-10);
    await sendOtp(digits, "delete-account");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/account/send-delete-otp error:", error?.response?.data || error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
