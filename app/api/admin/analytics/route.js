import { NextResponse } from "next/server";
import { isGa4Configured, getDashboardReports } from "@/lib/ga4Server";
import { matchCityState } from "@/lib/searchLocation";
import { isAdminRequest } from "@/lib/adminSession";

// Admin panel > Analytics page — gated by the real server-side admin session.

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOP_TERMS_PER_CITY = 8;

// GA4 has no city/state dimension for our search_term event — every
// search_term already ends with the free-text location though (e.g. "4 BHK
// • House • Sale • Raipur"), so state/city are recovered by matching known
// Indian city names inside it, then grouped into a State > City tree here —
// every state/city that has activity shows up, each with its own top searches.
function buildLocationBreakdown(topSearchTerms) {
  if (!topSearchTerms?.data) return null;

  const cityMap = new Map(); // "state||city" -> { state, city, total, terms: [] }
  let unmatchedTotal = 0;

  for (const row of topSearchTerms.data) {
    const count = Number(row.eventCount) || 0;
    const match = matchCityState(row["customEvent:search_term"]);
    if (!match?.state || !match?.city) {
      unmatchedTotal += count;
      continue;
    }
    const key = `${match.state}||${match.city}`;
    if (!cityMap.has(key)) {
      cityMap.set(key, { state: match.state, city: match.city, total: 0, terms: [] });
    }
    const entry = cityMap.get(key);
    entry.total += count;
    entry.terms.push({ term: row["customEvent:search_term"], count });
  }

  const cities = [...cityMap.values()]
    .map((c) => ({ ...c, terms: c.terms.sort((a, b) => b.count - a.count).slice(0, TOP_TERMS_PER_CITY) }))
    .sort((a, b) => b.total - a.total);

  const statesTotal = new Map();
  for (const c of cities) statesTotal.set(c.state, (statesTotal.get(c.state) || 0) + c.total);
  const states = [...statesTotal.entries()]
    .map(([state, total]) => ({ state, total }))
    .sort((a, b) => b.total - a.total);

  const matchedTotal = cities.reduce((sum, c) => sum + c.total, 0);

  return { states, cities, matchedTotal, unmatchedTotal };
}

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
  }

  if (!isGa4Configured()) {
    return NextResponse.json({ success: true, configured: false, reports: null });
  }

  try {
    const reports = await getDashboardReports({});
    reports.locationBreakdown = buildLocationBreakdown(reports.topSearchTerms);

    return NextResponse.json({ success: true, configured: true, reports });
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch GA4 analytics" },
      { status: 500 }
    );
  }
}
