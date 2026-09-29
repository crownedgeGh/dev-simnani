import { NextResponse } from "next/server";
import { sendOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

// Sends a login OTP to the given mobile number via the SMS gateway.
export async function POST(request) {
  try {
    const { mobile } = await request.json();
    const digits = (mobile || "").replace(/\D/g, "").slice(-10);

    if (digits.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Enter a valid 10-digit mobile number" },
        { status: 400 }
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
