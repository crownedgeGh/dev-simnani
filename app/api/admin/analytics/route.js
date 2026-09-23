import { NextResponse } from "next/server";
import { isGa4Configured, getDashboardReports } from "@/lib/ga4Server";

// Admin panel > Analytics page. Not gated by the buyer/broker session cookie
// — the admin panel has its own (client-side) auth gate (see AdminGuard),
// matching /api/admin/subscriptions and /api/admin/properties.

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  if (!isGa4Configured()) {
    return NextResponse.json({ success: true, configured: false, reports: null });
  }

  try {
    const reports = await getDashboardReports();
    return NextResponse.json({ success: true, configured: true, reports });
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch GA4 analytics" },
      { status: 500 }
    );
  }
}
