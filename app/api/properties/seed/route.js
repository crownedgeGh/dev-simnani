import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { PROPERTIES, getLocationCity } from "@/lib/properties";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    const count = await Property.countDocuments();

    if (count > 0 && !force) {
      return NextResponse.json({
        success: true,
        message: `Database already seeded with ${count} properties. Use ?force=true to re-seed.`,
        count,
      });
    }

    if (force) {
      await Property.deleteMany({});
    }

    const docs = PROPERTIES.map((p, index) => {
      const city = p.city || (p.location ? getLocationCity(p.location) : "") || "Other";
      return {
        id: p.id || `prop-${index + 1}`,
        title: p.title || "Untitled Property",
        type: p.type || "buy",
        price: p.price || "₹0",
        location: p.location || "Unknown Location",
        city,
        beds: Number(p.beds) || 0,
        baths: Number(p.baths) || 0,
        area: p.area || "",
        image: p.image || "",
        badge: p.badge || "",
        featured: !!p.featured,
        status: p.status || "Active",
        addedDate:
          p.addedDate ||
          new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      };
    });

    // Insert docs, ignore duplicates if any
    await Property.insertMany(docs, { ordered: false });

    const newCount = await Property.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${newCount} properties into MongoDB (database: simnani_estates)!`,
      count: newCount,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return GET(request);
}
