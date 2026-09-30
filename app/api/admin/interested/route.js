import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Property from "@/models/Property";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET — admin fetch every "I'm Interested" click, enriched with current property details
export async function GET(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();

    const clicks = await Lead.find({ source: "Interested Button" })
      .sort({ createdAt: -1 })
      .lean();

    const propertyIds = [...new Set(clicks.map((c) => c.propertyId).filter(Boolean))];
    const properties = await Property.find({ id: { $in: propertyIds } }).lean();
    const propertyById = new Map(properties.map((p) => [p.id, p]));

    const data = clicks.map((click) => {
      const property = propertyById.get(click.propertyId);
      return {
        ...click,
        propertyTitle: property?.title || click.interest || "—",
        propertyPrice: property?.price || "",
        propertyImage: property?.image || "",
        propertyLocation: property?.location || "",
        propertyType: property?.type || "",
        propertyStatus: property?.status || "",
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/admin/interested error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch interested clicks" },
      { status: 500 }
    );
  }
}
