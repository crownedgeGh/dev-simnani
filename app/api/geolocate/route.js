import { NextResponse } from "next/server";
import { normalizeCityState } from "@/lib/cityRto";

const DEFAULT_LOCATION = { city: "Raipur", state: "Chhattisgarh" };

function isPrivateIp(ip) {
  return (
    !ip ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

// Local/loopback addresses (e.g. "::1" from a direct dev-server request)
// aren't geolocatable — treat them as "no IP" so the lookup falls back to
// self-detecting the server's own outbound IP instead.
function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
  return isPrivateIp(ip) ? null : ip;
}

export async function GET(request) {
  const headers = request.headers;

  // Edge/CDN headers (Vercel or Cloudflare) when present — no network call needed.
  const headerLocation = normalizeCityState(
    headers.get("x-vercel-ip-city") || headers.get("cf-ipcity"),
    headers.get("x-vercel-ip-country-region") || headers.get("cf-region"),
  );
  if (headerLocation) return NextResponse.json(headerLocation);

  // Local dev / no edge headers — fall back to a free IP geolocation API.
  // No x-forwarded-for on a direct connection (e.g. localhost) means no
  // client IP to pass — ip-api.com's bare /json/ endpoint then self-detects
  // the caller's IP (the dev machine's real public IP) instead.
  const ip = clientIp(request);
  try {
    const res = await fetch(
      ip ? `http://ip-api.com/json/${ip}` : "http://ip-api.com/json/",
      { signal: AbortSignal.timeout(2500) },
    );
    if (res.ok) {
      const json = await res.json();
      if (json.status === "success") {
        const fallbackLocation = normalizeCityState(json.city, json.regionName);
        if (fallbackLocation) return NextResponse.json(fallbackLocation);
      }
    }
  } catch {
    // ponytail: ip-api.com unreachable/rate-limited — fall through to default
  }

  return NextResponse.json(DEFAULT_LOCATION);
}
