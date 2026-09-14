import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Session from "@/models/Session";
import { SESSION_COOKIE, clearSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) {
      await dbConnect();
      await Session.deleteOne({ token });
    }
    const res = NextResponse.json({ success: true });
    clearSessionCookie(res);
    return res;
  } catch (error) {
    console.error("POST /api/auth/logout error:", error);
    const res = NextResponse.json(
      { success: false, error: error.message || "Logout failed" },
      { status: 500 }
    );
    clearSessionCookie(res);
    return res;
  }
}
