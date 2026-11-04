import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { getSessionUser } from "@/lib/session";
import { getListingExpiry, isListingExpired, OWNER_SLOTS_FULL_MESSAGE } from "@/lib/properties";
import { ownerSlotsFull, overLimit } from "@/lib/listingSlots";

export const dynamic = "force-dynamic";

// Owner/builder: bring an expired listing back live for another full window.
// Needs a free active slot (the 5 slots reopen once old listings expire).
export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }

    const expiry = getListingExpiry(sessionUser.accountType);
    if (!expiry) {
      return NextResponse.json({ success: false, error: "This account type has no expiring listings" }, { status: 403 });
    }

    const existing = await Property.findOne({ id, ownerId: sessionUser.accountId }).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }
    if (!isListingExpired(existing)) {
      return NextResponse.json({ success: false, error: "This listing has not expired yet" }, { status: 400 });
    }
    if (await ownerSlotsFull(sessionUser)) {
      return NextResponse.json({ success: false, error: OWNER_SLOTS_FULL_MESSAGE }, { status: 403 });
    }

    const updated = await Property.findOneAndUpdate(
      { id, ownerId: sessionUser.accountId },
      { $set: { expiresAt: expiry, status: "Active" } },
      { new: true }
    ).lean();

    if (await overLimit(sessionUser)) {
      // lost a race with another post/renew — undo
      await Property.updateOne(
        { id, ownerId: sessionUser.accountId },
        { $set: { expiresAt: existing.expiresAt, status: existing.status } }
      );
      return NextResponse.json({ success: false, error: OWNER_SLOTS_FULL_MESSAGE }, { status: 409 });
    }

    return NextResponse.json({ success: true, message: "Listing renewed", data: updated });
  } catch (error) {
    console.error("POST /api/properties/[id]/renew error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to renew listing" },
      { status: 500 }
    );
  }
}
