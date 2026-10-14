import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Plot from "@/models/Plot";
import { isAdminRequest } from "@/lib/adminSession";
import {
  CLEARED_BUYER_FIELDS,
  DEFAULT_PROJECT,
  FACINGS,
  PLOT_STATUSES,
  parsePlotNumbers,
  splitPlotNumber,
} from "@/lib/plotInventory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_PLOTS_PER_REQUEST = 2000;

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const projectOf = (v) => (typeof v === "string" && v.trim() ? v.trim() : DEFAULT_PROJECT);

// GET /api/plots?project=T%26C%20RERA — every plot in one project's layout.
export async function GET(request) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    await dbConnect();
    const project = projectOf(new URL(request.url).searchParams.get("project"));
    const plots = await Plot.find({ project }).sort({ block: 1, seq: 1 }).lean();
    return NextResponse.json({ success: true, data: plots });
  } catch (error) {
    console.error("GET /api/plots error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load plots" }, { status: 500 });
  }
}

// POST /api/plots — create plots from a pasted list or a generated sequence.
// Body: { project, plotNumbers: ["F-1", …] | "F-1 F-2 …", defaults: {…} }
// Plot numbers that already exist in the project are skipped, not overwritten.
export async function POST(request) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    await dbConnect();
    const body = await request.json();
    const project = projectOf(body.project);
    const raw = Array.isArray(body.plotNumbers) ? body.plotNumbers.join(" ") : body.plotNumbers;
    const plotNumbers = parsePlotNumbers(raw);

    if (!plotNumbers.length) {
      return NextResponse.json({ success: false, error: "No valid plot numbers found (e.g. F-32)" }, { status: 400 });
    }
    if (plotNumbers.length > MAX_PLOTS_PER_REQUEST) {
      return NextResponse.json(
        { success: false, error: `Max ${MAX_PLOTS_PER_REQUEST} plots at a time` },
        { status: 400 }
      );
    }

    const d = body.defaults || {};
    const lengthFt = num(d.lengthFt);
    const widthFt = num(d.widthFt);
    const areaSqft = lengthFt && widthFt ? lengthFt * widthFt : num(d.areaSqft);
    const ratePerSqft = num(d.ratePerSqft);
    const extraCharges = num(d.extraCharges);
    const base = {
      project,
      lengthFt,
      widthFt,
      areaSqft,
      facing: FACINGS.includes(d.facing) ? d.facing : "",
      isCorner: !!d.isCorner,
      ratePerSqft,
      extraCharges,
      totalPrice: areaSqft * ratePerSqft + extraCharges,
      status: PLOT_STATUSES.includes(d.status) ? d.status : "available",
      reraRegNo: typeof d.reraRegNo === "string" ? d.reraRegNo.trim() : "",
    };

    const existing = new Set(
      (await Plot.find({ project, plotNumber: { $in: plotNumbers } }, { plotNumber: 1 }).lean()).map(
        (p) => p.plotNumber
      )
    );
    const docs = plotNumbers
      .filter((n) => !existing.has(n))
      .map((plotNumber) => ({ ...base, plotNumber, ...splitPlotNumber(plotNumber) }));

    if (docs.length) await Plot.insertMany(docs, { ordered: false });

    return NextResponse.json(
      { success: true, created: docs.length, skipped: existing.size, plotNumbers },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/plots error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create plots" }, { status: 500 });
  }
}

// Bulk filter: explicit ids from grid selection, or plot numbers pasted for
// a project ("mark these 30 as booked").
function bulkFilter(body) {
  if (Array.isArray(body.ids) && body.ids.length) return { _id: { $in: body.ids.map(String) } };
  const plotNumbers = parsePlotNumbers(Array.isArray(body.plotNumbers) ? body.plotNumbers.join(" ") : body.plotNumbers);
  if (plotNumbers.length) return { project: projectOf(body.project), plotNumber: { $in: plotNumbers } };
  return null;
}

// PATCH /api/plots — bulk status and/or rate update.
// Body: { ids | (project + plotNumbers), status?, ratePerSqft? }
export async function PATCH(request) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    await dbConnect();
    const body = await request.json();
    const filter = bulkFilter(body);
    if (!filter) {
      return NextResponse.json({ success: false, error: "Select at least one plot" }, { status: 400 });
    }

    const set = {};
    if (body.status !== undefined && body.status !== "") {
      if (!PLOT_STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }
      set.status = body.status;
      if (body.status === "available") Object.assign(set, CLEARED_BUYER_FIELDS);
    }
    if (body.ratePerSqft !== undefined && body.ratePerSqft !== "") {
      const rate = num(body.ratePerSqft);
      set.ratePerSqft = rate;
      set.totalPrice = { $add: [{ $multiply: ["$areaSqft", rate] }, { $ifNull: ["$extraCharges", 0] }] };
    }
    if (!Object.keys(set).length) {
      return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
    }

    // Pipeline update so totalPrice is recomputed from each plot's own area.
    const result = await Plot.updateMany(filter, [{ $set: set }], { updatePipeline: true });
    return NextResponse.json({ success: true, matched: result.matchedCount, modified: result.modifiedCount });
  } catch (error) {
    console.error("PATCH /api/plots error:", error);
    return NextResponse.json({ success: false, error: error.message || "Bulk update failed" }, { status: 500 });
  }
}

// DELETE /api/plots — bulk delete. Body: { ids: [...] }
export async function DELETE(request) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    await dbConnect();
    const body = await request.json();
    if (!Array.isArray(body.ids) || !body.ids.length) {
      return NextResponse.json({ success: false, error: "Select at least one plot" }, { status: 400 });
    }
    const result = await Plot.deleteMany({ _id: { $in: body.ids.map(String) } });
    return NextResponse.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error("DELETE /api/plots error:", error);
    return NextResponse.json({ success: false, error: error.message || "Delete failed" }, { status: 500 });
  }
}
