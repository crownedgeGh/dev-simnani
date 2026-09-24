import { NextResponse } from "next/server";
import { isGa4Configured, getDashboardReports } from "@/lib/ga4Server";
import { matchCityState } from "@/lib/searchLocation";

// Admin panel > Analytics page. Not gated by the buyer/broker session cookie
// — the admin panel has its own (client-side) auth gate (see AdminGuard),
// matching /api/admin/subscriptions and /api/admin/properties.

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GA4 has no city/state dimension for our search_term event — every
// search_term already ends with the free-text location though (e.g. "4 BHK
// • House • Sale • Raipur"), so state/city are recovered by matching known
// Indian city names inside it, then the panel is filtered + re-ranked here.
function applyLocationFilters(topSearchTerms, stateFilter, cityFilter) {
  if (!topSearchTerms?.data) return topSearchTerms;

  const enriched = topSearchTerms.data.map((row) => {
    const match = matchCityState(row["customEvent:search_term"]);
    return { ...row, city: match?.city || null, state: match?.state || null };
  });

  const availableStates = [...new Set(enriched.filter((r) => r.state).map((r) => r.state))].sort();
  const availableCities = [
    ...new Set(
      enriched
        .filter((r) => r.city && (!stateFilter || r.state === stateFilter))
        .map((r) => r.city)
    ),
  ].sort();

  let filtered = enriched;
  if (stateFilter) filtered = filtered.filter((r) => r.state === stateFilter);
  if (cityFilter) filtered = filtered.filter((r) => r.city === cityFilter);

  return { ...topSearchTerms, data: filtered.slice(0, 10), availableStates, availableCities };
}

export async function GET(request) {
  if (!isGa4Configured()) {
    return NextResponse.json({ success: true, configured: false, reports: null });
  }

  try {
    const { searchParams } = new URL(request.url);
    const stateFilter = searchParams.get("state") || "";
    const cityFilter = searchParams.get("city") || "";
    const searchTermsOnly = searchParams.get("searchTermsOnly") === "1";

    const reports = await getDashboardReports({ searchTermsOnly });
    reports.topSearchTerms = applyLocationFilters(reports.topSearchTerms, stateFilter, cityFilter);

    return NextResponse.json({ success: true, configured: true, reports });
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch GA4 analytics" },
      { status: 500 }
    );
  }
}
