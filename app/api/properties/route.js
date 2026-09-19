import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { getLocationCity, isStructureCategory, categoryHasBedrooms } from "@/lib/properties";
import { getSessionUser } from "@/lib/session";

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
    const contactMobile = searchParams.get("contactMobile");
    const ownerId = searchParams.get("ownerId");

    const query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (ownerId) {
      query.ownerId = ownerId;
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

    let properties = await Property.find(query).sort({ createdAt: -1 }).lean();

    if (contactMobile) {
      const digits = contactMobile.replace(/\D/g, "").slice(-10);
      properties = properties.filter(
        (p) => (p.contact?.mobile || "").replace(/\D/g, "").slice(-10) === digits
      );
    }

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

    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to post a property" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const needsStructureFields = isStructureCategory(body.type, body.category);
    const needsBedrooms = categoryHasBedrooms(body.type, body.category);

    const baths = Number(body.baths) || 0;
    if (needsStructureFields && baths < 1) {
      return NextResponse.json(
        { success: false, error: "Number of bathrooms is required" },
        { status: 400 }
      );
    }

    const beds = Number(body.beds) || 0;
    if (needsBedrooms && beds < 1) {
      return NextResponse.json(
        { success: false, error: "Number of bedrooms (BHK) is required" },
        { status: 400 }
      );
    }

    const halls = Number(body.halls) || 0;
    if (needsBedrooms && halls < 1) {
      return NextResponse.json(
        { success: false, error: "Number of halls is required" },
        { status: 400 }
      );
    }

    const id = body.id || `PROP-${Date.now()}`;
    const city = body.city || (body.location ? getLocationCity(body.location) : "") || "Other";

    const propertyData = {
      ...body,
      id,
      city,
      beds,
      bedsPlus: Boolean(body.bedsPlus),
      halls,
      baths,
      ownerId: sessionUser.accountId,
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
