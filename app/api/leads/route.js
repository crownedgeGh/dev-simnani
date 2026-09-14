import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Property from "@/models/Property";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }

    await dbConnect();
    const leads = await Lead.find({ ownerId: sessionUser.accountId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { propertyId } = body;
    if (!propertyId) {
      return NextResponse.json({ success: false, error: "propertyId is required" }, { status: 400 });
    }

    const property = await Property.findOne({
      $or: [{ id: propertyId }, { _id: propertyId.match(/^[0-9a-fA-F]{24}$/) ? propertyId : null }],
    }).lean();

    if (!property) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }

    if (!property.ownerId) {
      return NextResponse.json({ success: false, error: "This property has no owning broker" }, { status: 400 });
    }

    const lead = await Lead.create({
      id: `LD-${Math.floor(100000 + Math.random() * 900000)}`,
      name: sessionUser.fullName,
      phone: sessionUser.mobile,
      address: sessionUser.city || "",
      propertyId: property.id,
      interest: property.title,
      ownerId: property.ownerId,
    });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create lead" },
      { status: 500 }
    );
  }
}
