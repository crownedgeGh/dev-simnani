import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { getLocationCity } from "@/lib/properties";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const property = await Property.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

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
    const body = await request.json();

    const updateData = { ...body };
    if (updateData.location && !updateData.city) {
      updateData.city = getLocationCity(updateData.location) || "Other";
    }
    if (updateData.beds !== undefined) updateData.beds = Number(updateData.beds) || 0;
    if (updateData.baths !== undefined) updateData.baths = Number(updateData.baths) || 0;

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
