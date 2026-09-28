import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContactInquiry from "@/models/ContactInquiry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST — public form submission (no auth required)
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, phone, email, message, userType, source, propertyTitle } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const inquiry = await ContactInquiry.create({
      id: `INQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || "",
      message: message?.trim() || "",
      userType: userType || "buyer",
      source: source || "Website",
      propertyTitle: propertyTitle?.trim() || "",
    });

    return NextResponse.json({ success: true, data: inquiry });
  } catch (error) {
    console.error("POST /api/contact-inquiry error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
