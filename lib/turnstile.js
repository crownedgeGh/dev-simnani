// Server-side verification for Cloudflare Turnstile tokens.
// If TURNSTILE_SECRET_KEY isn't configured yet, verification is skipped
// (returns true) so the app keeps working before the key is added —
// see SECURITY.md for setup.
export async function verifyTurnstile(token, request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
      }),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}
