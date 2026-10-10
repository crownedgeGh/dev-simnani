import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import {
  getLocationCity,
  categoryHasBedrooms,
  isPgOrHostel,
  isResidentialSection,
  RESIDENTIAL_PROPERTY_TYPES,
} from "@/lib/properties";
import { getPropertyById } from "@/lib/propertiesServer";
import { getSessionUser } from "@/lib/session";
import { isAdminRequest } from "@/lib/adminSession";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request, { params }) {
  try {
    if (isRateLimited(request, { limit: 120, windowMs: 60 * 1000, key: "property-detail" })) {
      return rateLimitResponse();
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const property = await getPropertyById(id);

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    const isAdmin = isAdminRequest(request);
    const sessionUser = await getSessionUser(request);
    const canSeeContact = isAdmin || (sessionUser && sessionUser.accountId === property.ownerId);
    const safeProperty = canSeeContact
      ? property
      : { ...property, contact: { ...property.contact, mobile: "" } };

    return NextResponse.json({ success: true, data: safeProperty });
  } catch (error) {
    console.error("GET /api/properties/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch property" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }

    const existing = await Property.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!existing) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }

    if (existing.ownerId !== sessionUser.accountId) {
      return NextResponse.json(
        { success: false, error: "You can only manage your own listings" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Task 4 (API-side backstop): a closed listing can only be reopened
    // (status toggle), not edited — the portal already hides the Edit
    // button, this stops the same thing via a direct API call.
    const isContentEditAttempt = Object.keys(body).some((key) => key !== "status");
    if (existing.status === "Closed" && isContentEditAttempt) {
      return NextResponse.json(
        { success: false, error: "Reopen this listing before editing it" },
        { status: 403 }
      );
    }

    // Task 1: once a listing is approved (status "Active"), its core identity
    // fields are locked — editing them here would let a user "replace" an
    // approved listing with a different property without admin review.
    const LOCKED_FIELDS_WHEN_APPROVED = [
      "purpose",
      "type",
      "category",
      "propertyType",
      "state",
      "city",
      "locality",
      "beds",
      "bedsPlus",
    ];
    if (existing.status === "Active") {
      const changedLockedField = LOCKED_FIELDS_WHEN_APPROVED.find(
        (field) => field in body && body[field] !== existing[field]
      );
      if (changedLockedField) {
        return NextResponse.json(
          { success: false, error: `${changedLockedField} cannot be changed once the listing is approved` },
          { status: 403 }
        );
      }
    }

    // Task 2: price and built-up area can be nudged up, not replaced — cap
    // increases to 30% of the current approved value. Decreases (discounts,
    // re-measured area, etc.) are unrestricted.
    const MAX_INCREASE = 0.3;
    if (body.rawPrice !== undefined && existing.rawPrice) {
      const delta = (Number(body.rawPrice) - existing.rawPrice) / existing.rawPrice;
      if (delta > MAX_INCREASE) {
        return NextResponse.json(
          { success: false, error: "Price can only increase by up to 30% of its current value" },
          { status: 400 }
        );
      }
    }
    if (body.areaSize !== undefined && existing.areaSize) {
      const delta = (Number(body.areaSize) - existing.areaSize) / existing.areaSize;
      if (delta > MAX_INCREASE) {
        return NextResponse.json(
          { success: false, error: "Built-up area can only increase by up to 30% of its current value" },
          { status: 400 }
        );
      }
    }

    const updateData = { ...body };
    if (updateData.location && !updateData.city) {
      updateData.city = getLocationCity(updateData.location) || "Other";
    }

    // Task 3: any edit to an already-approved listing (description, photos,
    // minor price tweaks, etc.) sends it back for admin re-verification.
    // Pure status toggles (Close/Reopen, which only send { status }) are
    // exempt — those aren't content edits.
    if (existing.status === "Active" && isContentEditAttempt) {
      updateData.status = "Pending Review";
    }

    const effectiveType = updateData.type ?? existing.type;
    const effectiveCategory = updateData.category ?? existing.category;
    const effectivePropertyType = updateData.propertyType ?? existing.propertyType;

    if (isResidentialSection(effectiveType) && !RESIDENTIAL_PROPERTY_TYPES.includes(effectivePropertyType)) {
      return NextResponse.json(
        { success: false, error: "Invalid property type for a Residential listing" },
        { status: 400 }
      );
    }

    const isPgHostel = isPgOrHostel(effectivePropertyType);
    const needsBedrooms = categoryHasBedrooms(effectiveType, effectiveCategory, effectivePropertyType);

    if (updateData.beds !== undefined) {
      const beds = Number(updateData.beds) || 0;
      if (needsBedrooms && beds < 1) {
        return NextResponse.json(
          { success: false, error: "Number of bedrooms (BHK) is required" },
          { status: 400 }
        );
      }
      updateData.beds = beds;
    }
    if (updateData.bedsPlus !== undefined) {
      updateData.bedsPlus = Boolean(updateData.bedsPlus);
    }
    if (updateData.halls !== undefined) {
      updateData.halls = Number(updateData.halls) || 0;
    }
    if (updateData.baths !== undefined) {
      updateData.baths = Number(updateData.baths) || 0;
    }

    const updated = await Property.findOneAndUpdate(
      { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Property updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/properties/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }

    const existing = await Property.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!existing) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }

    if (existing.ownerId !== sessionUser.accountId) {
      return NextResponse.json(
        { success: false, error: "You can only manage your own listings" },
        { status: 403 }
      );
    }

    const deleted = await Property.findOneAndDelete({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
      id,
    });
  } catch (error) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete property" },
      { status: 500 }
    );
  }
}
