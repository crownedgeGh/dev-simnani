import { NextResponse } from "next/server";

// Lightweight in-memory, per-IP sliding-window rate limiter — blunts naive
// bulk scraping/dumping of public read endpoints. This only limits within a
// single server process; a multi-instance deployment needs a shared store
// (e.g. Upstash Redis) for the same guarantee across instances.
const buckets = new Map();
const MAX_TRACKED_BUCKETS = 20000;

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export function isRateLimited(request, { limit, windowMs, key }) {
  const bucketKey = `${key}:${getClientIp(request)}`;
  const now = Date.now();
  const entry = buckets.get(bucketKey);

  if (!entry || now - entry.start > windowMs) {
    if (buckets.size > MAX_TRACKED_BUCKETS) buckets.clear();
    buckets.set(bucketKey, { start: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

export function rateLimitResponse() {
  return NextResponse.json(
    { success: false, error: "Too many requests — please slow down and try again shortly." },
    { status: 429 }
  );
}
