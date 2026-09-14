import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import Session from "@/models/Session";
import User from "@/models/User";

export const SESSION_COOKIE = "se_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

async function resolveUser(token) {
  if (!token) return null;
  await dbConnect();
  const session = await Session.findOne({ token, expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;
  return User.findOne({ accountId: session.accountId }).lean();
}

// Reads the session cookie off an incoming request (Route Handlers) and
// resolves the logged-in user from the database. Returns null if there is
// no valid, unexpired session — callers treat that as "not authenticated".
export async function getSessionUser(request) {
  return resolveUser(request.cookies.get(SESSION_COOKIE)?.value);
}

// Same lookup, for Server Components / Server Actions where the cookie
// jar comes from next/headers instead of a NextRequest.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  return resolveUser(cookieStore.get(SESSION_COOKIE)?.value);
}

export function setSessionCookie(response, token) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}
