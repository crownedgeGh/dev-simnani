import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { setAdminSessionCookie } from "@/lib/adminSession";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(request) {
  if (isRateLimited(request, { limit: 10, windowMs: 5 * 60 * 1000, key: "admin-login" })) {
    return rateLimitResponse();
  }

  try {
    const { email, password } = await request.json();
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      console.error("ADMIN_EMAIL / ADMIN_PASSWORD_HASH is not configured");
      return NextResponse.json(
        { success: false, error: "Admin login is not configured" },
        { status: 500 }
      );
    }

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.trim().toLowerCase() !== adminEmail.toLowerCase()
    ) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, adminPasswordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    setAdminSessionCookie(response);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
