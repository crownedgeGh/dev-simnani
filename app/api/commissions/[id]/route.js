import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Commission from "@/models/Commission";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PATCHABLE_FIELDS = ["approvalStatus", "amount"];

export async function PATCH(request, { params }) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const body = await request.json();
    const update = {};
    for (const key of PATCHABLE_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const updated = await Commission.findOneAndUpdate({ id }, { $set: update }, { new: true, runValidators: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, error: "Commission not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/commissions/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update commission" },
      { status: 500 }
    );
  }
}
