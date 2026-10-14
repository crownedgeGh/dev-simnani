import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import HomeLoanBank from "@/models/HomeLoanBank";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EDITABLE_FIELDS = [
  "name",
  "logo",
  "rate",
  "fee",
  "tenureMin",
  "tenureMax",
  "featured",
  "knowMoreHref",
  "isActive",
  "order",
];

export async function PATCH(request, { params }) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const update = {};
    for (const field of EDITABLE_FIELDS) {
      if (body[field] === undefined) continue;
      update[field] =
        ["rate", "fee", "tenureMin", "tenureMax", "order"].includes(field)
          ? Number(body[field])
          : field === "featured" || field === "isActive"
          ? !!body[field]
          : typeof body[field] === "string"
          ? body[field].trim()
          : body[field];
    }

    const updated = await HomeLoanBank.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Bank not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/home-loan-banks/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update bank" },
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

    const deleted = await HomeLoanBank.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Bank not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    console.error("DELETE /api/home-loan-banks/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete bank" },
      { status: 500 }
    );
  }
}
