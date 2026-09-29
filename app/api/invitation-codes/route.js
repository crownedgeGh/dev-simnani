import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InvitationCode from "@/models/InvitationCode";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const cpType = searchParams.get("cpType");
    const code = searchParams.get("code");

    const query = {};
    if (cpType) query.cpType = cpType;
    if (code) query.code = code.trim().toUpperCase();

    const codes = await InvitationCode.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, count: codes.length, data: codes });
  } catch (error) {
    console.error("GET /api/invitation-codes error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch invitation codes" },
      { status: 500 }
    );
  }
}

// Generated from the admin CP workspace — trusted, no session of its own.
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { code, cpType, name, mobile, city, state, address } = body;

    if (!code || !cpType) {
      return NextResponse.json({ success: false, error: "code and cpType are required" }, { status: 400 });
    }

    const invitationCode = await InvitationCode.create({
      code: code.trim().toUpperCase(),
      cpType,
      name: name || "",
      mobile: mobile || "",
      city: city || "",
      state: state || "",
      address: address || "",
    });

    return NextResponse.json({ success: true, data: invitationCode }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "This code already exists — try again" }, { status: 409 });
    }
    console.error("POST /api/invitation-codes error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate invitation code" },
      { status: 500 }
    );
  }
}
