import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { getLocationCity, isStructureCategory, categoryHasBedrooms } from "@/lib/properties";
import { getPropertyById } from "@/lib/propertiesServer";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const property = await getPropertyById(id);

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: property });
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

    const updateData = { ...body };
    if (updateData.location && !updateData.city) {
      updateData.city = getLocationCity(updateData.location) || "Other";
    }

    const effectiveType = updateData.type ?? existing.type;
    const effectiveCategory = updateData.category ?? existing.category;
    const needsStructureFields = isStructureCategory(effectiveType, effectiveCategory);
    const needsBedrooms = categoryHasBedrooms(effectiveType, effectiveCategory);

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
      const halls = Number(updateData.halls) || 0;
      if (needsBedrooms && halls < 1) {
        return NextResponse.json(
          { success: false, error: "Number of halls is required" },
          { status: 400 }
        );
      }
      updateData.halls = halls;
    }
    if (updateData.baths !== undefined) {
      const baths = Number(updateData.baths) || 0;
      if (needsStructureFields && baths < 1) {
        return NextResponse.json(
          { success: false, error: "Number of bathrooms is required" },
          { status: 400 }
        );
      }
      updateData.baths = baths;
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
