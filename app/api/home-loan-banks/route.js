import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import HomeLoanBank from "@/models/HomeLoanBank";
import { HOME_LOAN_BANKS_SEED } from "@/lib/homeLoanBanksSeed";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Public: active banks only, sorted for display. Admin: everything, so
// hidden/inactive rows stay editable from the admin panel.
export async function GET(request) {
  try {
    await dbConnect();

    const count = await HomeLoanBank.countDocuments();
    if (count === 0) {
      await HomeLoanBank.insertMany(HOME_LOAN_BANKS_SEED);
    }

    const filter = isAdminRequest(request) ? {} : { isActive: true };
    const banks = await HomeLoanBank.find(filter).sort({ order: 1, name: 1 }).lean();

    return NextResponse.json({ success: true, data: banks });
  } catch (error) {
    console.error("GET /api/home-loan-banks error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bank deals" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    if (!body.name?.trim() || !body.logo?.trim() || body.rate == null || body.fee == null) {
      return NextResponse.json(
        { success: false, error: "name, logo, rate and fee are required" },
        { status: 400 }
      );
    }

    const created = await HomeLoanBank.create({
      name: body.name.trim(),
      logo: body.logo.trim(),
      rate: Number(body.rate),
      fee: Number(body.fee),
      tenureMin: Number(body.tenureMin ?? 1),
      tenureMax: Number(body.tenureMax ?? 30),
      featured: !!body.featured,
      knowMoreHref: body.knowMoreHref?.trim() || "",
      isActive: body.isActive ?? true,
      order: Number(body.order ?? 0),
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/home-loan-banks error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add bank" },
      { status: 500 }
    );
  }
}
