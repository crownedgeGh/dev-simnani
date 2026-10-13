import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { SERVICE_PROVIDER_TYPE_VALUES } from "@/lib/serviceProviders";

export const dynamic = "force-dynamic";

// Public contact directory for service providers — powers the "Call Now"
// list on /farming, /industrial, /properties and /commercial. Returns only
// the fields needed to show and dial a provider, never the whole user doc.
const PUBLIC_FIELDS =
  "fullName mobile city state serviceType yearsOfExperience";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");
    const state = (searchParams.get("state") || "").trim();
    const city = (searchParams.get("city") || "").trim();

    if (!SERVICE_PROVIDER_TYPE_VALUES.includes(serviceType)) {
      return NextResponse.json(
        { success: false, error: "Valid serviceType is required" },
        { status: 400 },
      );
    }
    if (!state) {
      return NextResponse.json(
        { success: false, error: "state is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Escape before building a RegExp — city/state arrive from the client.
    const exactly = (v) =>
      new RegExp(`^${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

    const base = {
      accountType: "service-provider",
      status: "Active",
      serviceType,
    };
    const find = (extra) =>
      User.find({ ...base, ...extra })
        .select(PUBLIC_FIELDS)
        .sort({ fullName: 1 })
        .lean();

    // City match first; fall back to the rest of the state so an empty city
    // never leaves the caller with nothing to dial.
    const exact = city ? await find({ city: exactly(city) }) : [];
    const data = exact.length ? exact : await find({ state: exactly(state) });

    return NextResponse.json({
      success: true,
      scope: exact.length ? "city" : "state",
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("GET /api/service-providers error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch service providers",
      },
      { status: 500 },
    );
  }
}
