import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { getListingLimit, getVisibilityMonths } from "@/lib/properties";
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
    const count = await Property.countDocuments({ ownerId: sessionUser.accountId });
    const limitReached = count >= limit;

    let waitUntil = null;
    const months = getVisibilityMonths(sessionUser.accountType);
    if (limitReached && months) {
      const lastListing = await Property.findOne({ ownerId: sessionUser.accountId })
        .sort({ createdAt: -1 })
        .lean();
      if (lastListing?.createdAt) {
        const wait = new Date(lastListing.createdAt);
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
