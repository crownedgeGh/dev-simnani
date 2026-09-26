import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { PROPERTIES, getLocationCity } from "@/lib/properties";

// Admin-panel property mutations. Unlike /api/properties/[id], this route is
// not gated by the buyer/broker session cookie or ownerId — the admin panel
// has its own (client-side) auth gate and must be able to manage any
// listing, including the static demo properties from lib/properties.js
// that don't exist as Mongo documents yet.

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    let existing = await Property.findOne({ id }).lean();

    if (!existing) {
      const staticProperty = PROPERTIES.find((p) => p.id === id);
      if (!staticProperty) {
        return NextResponse.json(
          { success: false, error: "Property not found" },
          { status: 404 }
        );
      }
      // First admin edit of a static demo property — persist it to Mongo
      // so future reads (public site + admin) share the same source of truth.
      const created = await Property.create({
        ...staticProperty,
        city: staticProperty.city || getLocationCity(staticProperty.location) || "Other",
      });
      existing = created.toObject();
    }

    const updateData = { ...body };
    if (updateData.location && !updateData.city) {
      updateData.city = getLocationCity(updateData.location) || "Other";
    }

    if (updateData.featured === true && !existing.featured) {
      const featuredCount = await Property.countDocuments({ featured: true });
      if (featuredCount >= 6) {
        return NextResponse.json(
          {
            success: false,
            error: "Only 6 properties can be featured at a time. Unfeature another property first.",
          },
          { status: 400 }
        );
      }
    }

    const updated = await Property.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "Property updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/properties/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update property" },
      { status: 500 }
    );
  }
}
