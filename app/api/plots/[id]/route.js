import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Plot from "@/models/Plot";
import { isAdminRequest } from "@/lib/adminSession";
import { CLEARED_BUYER_FIELDS, FACINGS, PLOT_STATUSES, splitPlotNumber } from "@/lib/plotInventory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });

const NUMBER_FIELDS = ["lengthFt", "widthFt", "areaSqft", "ratePerSqft", "extraCharges", "tokenAmount"];
const STRING_FIELDS = ["buyerName", "buyerPhone", "reraRegNo", "notes"];

// PATCH /api/plots/:id — edit one plot from the plot drawer. Area and total
// price are always recomputed here so the client can't save a stale total.
export async function PATCH(request, { params }) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const plot = await Plot.findById(id);
    if (!plot) return NextResponse.json({ success: false, error: "Plot not found" }, { status: 404 });

    for (const f of NUMBER_FIELDS) {
      if (body[f] === undefined) continue;
      const n = Number(body[f]);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ success: false, error: `${f} must be a positive number` }, { status: 400 });
      }
      plot[f] = n;
    }
    for (const f of STRING_FIELDS) {
      if (typeof body[f] === "string") plot[f] = body[f].trim();
    }
    if (body.facing !== undefined) plot.facing = FACINGS.includes(body.facing) ? body.facing : "";
    if (body.isCorner !== undefined) plot.isCorner = !!body.isCorner;
    if (body.bookingDate !== undefined) plot.bookingDate = body.bookingDate ? new Date(body.bookingDate) : null;
    if (body.status !== undefined) {
      if (!PLOT_STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }
      plot.status = body.status;
      if (body.status === "available") plot.set(CLEARED_BUYER_FIELDS);
    }
    if (typeof body.plotNumber === "string" && body.plotNumber.trim()) {
      const { block, seq } = splitPlotNumber(body.plotNumber.trim());
      if (!block) {
        return NextResponse.json({ success: false, error: "Plot number must look like F-32" }, { status: 400 });
      }
      plot.plotNumber = `${block}-${seq}`;
      plot.block = block;
      plot.seq = seq;
    }

    if (plot.lengthFt && plot.widthFt) plot.areaSqft = plot.lengthFt * plot.widthFt;
    plot.totalPrice = plot.areaSqft * plot.ratePerSqft + plot.extraCharges;

    await plot.save();
    return NextResponse.json({ success: true, data: plot });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "That plot number already exists" }, { status: 409 });
    }
    console.error("PATCH /api/plots/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update plot" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await Plot.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, error: "Plot not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    console.error("DELETE /api/plots/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete plot" }, { status: 500 });
  }
}
