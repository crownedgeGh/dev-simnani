import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { getLocationCity } from "@/lib/properties";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const city = searchParams.get("city");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    const query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (city && city !== "all") {
      query.city = city;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
      ];
    }

    const properties = await Property.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    const id = body.id || `PROP-${Date.now()}`;
    const city = body.city || (body.location ? getLocationCity(body.location) : "") || "Other";

    const propertyData = {
      ...body,
      id,
      city,
      beds: Number(body.beds) || 0,
      baths: Number(body.baths) || 0,
      addedDate:
        body.addedDate ||
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    };

    const newProperty = await Property.create(propertyData);

    return NextResponse.json(
      {
        success: true,
        message: "Property created successfully",
        data: newProperty,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create property" },
      { status: 500 }
    );
  }
}
