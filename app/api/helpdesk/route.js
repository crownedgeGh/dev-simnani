import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import HelpdeskTicket from "@/models/HelpdeskTicket";
import Property from "@/models/Property";
import { getSessionUser } from "@/lib/session";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST — logged-in user asks customer care to change a locked listing field
export async function POST(request) {
  try {
    if (isRateLimited(request, { limit: 10, windowMs: 10 * 60 * 1000, key: "helpdesk" })) {
      return rateLimitResponse();
    }

    await dbConnect();

    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Login required" }, { status: 401 });
    }

    const { propertyId, message } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }

    const property = propertyId ? await Property.findOne({ id: propertyId }).lean() : null;

    const ticket = await HelpdeskTicket.create({
      id: `HD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      accountId: user.accountId,
      userName: user.fullName || "",
      userPhone: user.mobile || "",
      userEmail: user.email || "",
      accountType: user.accountType || "",
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
