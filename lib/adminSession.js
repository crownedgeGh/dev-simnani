import crypto from "crypto";

// Real server-side admin session — signed cookie, verified on every request.
// Replaces the old scheme where admin@simnani.com/admin123 was hardcoded in
// context/AdminAuthContext.jsx and shipped in the client bundle with zero
// server-side enforcement (any /api/admin/* route was reachable by anyone
// who just curled it, regardless of what the admin UI showed).
export const ADMIN_SESSION_COOKIE = "se_admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours, in seconds

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set — see .env.local");
  }
  return secret;
}

function sign(payload) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createAdminSessionToken() {
  const expiresAt = String(Date.now() + ADMIN_SESSION_MAX_AGE * 1000);
  return `${expiresAt}.${sign(expiresAt)}`;
}

function verifyAdminSessionToken(token) {
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;

  const expectedSignature = sign(expiresAt);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return false;
  }

  return Date.now() < Number(expiresAt);
}

// Reads the admin session cookie off an incoming Route Handler request.
export function isAdminRequest(request) {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export function setAdminSessionCookie(response) {
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export function clearAdminSessionCookie(response) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}
