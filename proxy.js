import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isAdminRequest, setAdminSessionCookie } from "@/lib/adminSession";

// Sliding-expiry renewal: the admin session token has a fixed 12h lifetime
// (lib/adminSession.js), so an admin working through a full day would get
// logged out mid-session. Reissue the cookie on every request while it's
// still valid, so active daily use never hits the hard expiry.
export function proxy(request) {
  if (!request.cookies.get(ADMIN_SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  if (isAdminRequest(request)) {
    setAdminSessionCookie(response);
  }
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
