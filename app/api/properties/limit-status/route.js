import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { getListingLimit, getVisibilityMonths, listingCountFilter } from "@/lib/properties";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }

    await dbConnect();

    const limit = getListingLimit(sessionUser.accountType, sessionUser.topupCredits);
    const count = await Property.countDocuments(listingCountFilter(sessionUser.accountId, sessionUser.accountType));
    const limitReached = count >= limit;

    // Owner/builder: slots free up when a listing is deactivated/sold, or at
    // the earliest expiry. Broker: oldest listing ages out of the rolling window.
    let waitUntil = null;
    const months = getVisibilityMonths(sessionUser.accountType);
    if (limitReached && months) {
      const oldest = await Property.findOne(listingCountFilter(sessionUser.accountId, sessionUser.accountType))
        .sort({ expiresAt: 1, createdAt: 1 })
        .lean();
      if (oldest?.expiresAt) {
        waitUntil = new Date(oldest.expiresAt).toISOString();
      } else if (oldest?.createdAt) {
        const wait = new Date(oldest.createdAt);
        wait.setMonth(wait.getMonth() + months);
        waitUntil = wait.toISOString();
      }
    }

    return NextResponse.json({
      success: true,
      data: { limitReached, limit, count, waitUntil, accountType: sessionUser.accountType },
    });
  } catch (error) {
    console.error("GET /api/properties/limit-status error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check listing limit" },
      { status: 500 }
    );
  }
}
