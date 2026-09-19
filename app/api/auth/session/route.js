import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import { SESSION_MAX_AGE, setSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

// Creates a DB-backed session for an already-known accountId — used right
// after registration (the user record already exists) and for the tester
// fast-track login (creates a minimal user record on first use). The
// database is always the source of truth for the returned profile.
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body?.accountId) {
      return NextResponse.json(
        { success: false, error: "accountId is required" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ accountId: body.accountId }).lean();
    if (!user) {
      const created = await User.create({
        accountId: body.accountId,
        fullName: body.fullName || "",
        mobile: body.mobile || "",
        email: body.email || "",
        city: body.city || "",
        accountType: body.accountType || "common-person",
        reraRegistered: body.reraRegistered,
        reraNumber: body.reraNumber || "",
      });
      user = created.toObject();
    }

    const token = crypto.randomBytes(32).toString("hex");
    await Session.create({
      token,
      accountId: user.accountId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    });

    const res = NextResponse.json({ success: true, data: user });
    setSessionCookie(res, token);
    return res;
  } catch (error) {
    console.error("POST /api/auth/session error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create session" },
      { status: 500 }
    );
  }
}
