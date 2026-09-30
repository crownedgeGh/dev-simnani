import { NextResponse } from "next/server";
import { getPremiumBrokers } from "@/lib/brokersServer";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Premium-plan brokers, for the admin "Featured Brokers" screen — lets an
// admin pick which of them show up on the homepage and in what order.
export async function GET(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    const brokers = await getPremiumBrokers();
    return NextResponse.json({ success: true, count: brokers.length, data: brokers });
  } catch (error) {
    console.error("GET /api/admin/brokers/featured error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch brokers" },
      { status: 500 }
    );
  }
}
