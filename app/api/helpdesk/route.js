import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import HelpdeskTicket from "@/models/HelpdeskTicket";
import Property from "@/models/Property";
import { getSessionUser } from "@/lib/session";
import { isMobileValid } from "@/lib/auth";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST — logged-in user asks customer care to change a locked listing field,
// or any visitor (e.g. the public Helpdesk form on /about) sending a query
export async function POST(request) {
  try {
    if (isRateLimited(request, { limit: 10, windowMs: 10 * 60 * 1000, key: "helpdesk" })) {
      return rateLimitResponse();
    }

    await dbConnect();

    const user = await getSessionUser(request);
    const body = await request.json();
    const { propertyId, message, name, phone, turnstileToken } = body;

    if (!user && !(await verifyTurnstile(turnstileToken, request))) {
      return NextResponse.json(
        { success: false, error: "Verification failed. Please try again." },
        { status: 400 }
      );
    }

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }

    const userName = user?.fullName || name?.trim() || "";
    const userPhone = user?.mobile || phone?.trim() || "";

    if (!user && (!userName || !isMobileValid(userPhone))) {
      return NextResponse.json(
        { success: false, error: "Name and a valid 10-digit mobile number are required" },
        { status: 400 }
      );
    }

    const existingCount = await HelpdeskTicket.countDocuments({ userPhone });
    if (existingCount >= 2) {
      return NextResponse.json(
        { success: false, error: "You've already submitted 2 queries with this mobile number. Please wait for a response." },
        { status: 429 }
      );
    }

    const property = propertyId ? await Property.findOne({ id: propertyId }).lean() : null;

    const ticket = await HelpdeskTicket.create({
      id: `HD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      accountId: user?.accountId || `GUEST-${userPhone}`,
      userName,
      userPhone,
      userEmail: user?.email || "",
      accountType: user?.accountType || "",
      propertyId: propertyId || "",
      propertyTitle: property?.title || "",
      message: message.trim(),
    });

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("POST /api/helpdesk error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit request" },
      { status: 500 }
    );
  }
}
