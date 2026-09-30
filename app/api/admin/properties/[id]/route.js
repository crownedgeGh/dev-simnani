import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { PROPERTIES, getLocationCity } from "@/lib/properties";
import { isAdminRequest } from "@/lib/adminSession";

// Admin-panel property mutations. Unlike /api/properties/[id], this route
// manages any listing (including static demo properties not yet in Mongo),
// so it's gated by the real server-side admin session instead of ownerId.

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(request, { params }) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

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

    revalidatePath("/");
    revalidatePath("/buy");
    revalidatePath("/rent");
    revalidatePath("/sell");
    revalidatePath("/invest");
    revalidatePath(`/property/${id}`);

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

export async function DELETE(request, { params }) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const deleted = await Property.findOneAndDelete({ id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    revalidatePath("/");
    revalidatePath("/buy");
    revalidatePath("/rent");
    revalidatePath("/sell");
    revalidatePath("/invest");
    revalidatePath(`/property/${id}`);

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully",
      id,
    });
  } catch (error) {
    console.error("DELETE /api/admin/properties/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete property" },
      { status: 500 }
    );
  }
}
