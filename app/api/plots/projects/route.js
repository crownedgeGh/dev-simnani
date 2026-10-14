import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Plot from "@/models/Plot";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// A project is just the `project` name shared by its plots — there's no
// separate collection. A new project appears once its first plots are added.

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });

const cleanName = (v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");

// GET /api/plots/projects — one summary row per project.
export async function GET(request) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    await dbConnect();
    const statusCount = (s) => ({ $sum: { $cond: [{ $eq: ["$status", s] }, 1, 0] } });
    const rows = await Plot.aggregate([
      {
        $group: {
          _id: "$project",
          total: { $sum: 1 },
          available: statusCount("available"),
          booked: statusCount("booked"),
          hold: statusCount("hold"),
          blocked: statusCount("blocked"),
          blocks: { $addToSet: "$block" },
          totalValue: { $sum: "$totalPrice" },
          bookedValue: { $sum: { $cond: [{ $eq: ["$status", "booked"] }, "$totalPrice", 0] } },
          reraRegNo: { $max: "$reraRegNo" },
          updatedAt: { $max: "$updatedAt" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const data = rows.map(({ _id, blocks, ...r }) => ({ project: _id, blocks: blocks.sort(), ...r }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/plots/projects error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load projects" }, { status: 500 });
  }
}

// PATCH /api/plots/projects — rename. Body: { from, to }
export async function PATCH(request) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    await dbConnect();
    const body = await request.json();
    const from = cleanName(body.from);
    const to = cleanName(body.to);
    if (!from || !to) return NextResponse.json({ success: false, error: "Project name is required" }, { status: 400 });
    if (from !== to && (await Plot.exists({ project: to }))) {
      return NextResponse.json({ success: false, error: `"${to}" already exists` }, { status: 409 });
    }
    const result = await Plot.updateMany({ project: from }, { $set: { project: to } });
    return NextResponse.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    console.error("PATCH /api/plots/projects error:", error);
    return NextResponse.json({ success: false, error: error.message || "Rename failed" }, { status: 500 });
  }
}

// DELETE /api/plots/projects — delete a project and all its plots. Body: { project }
export async function DELETE(request) {
  if (!isAdminRequest(request)) return unauthorized();
  try {
    await dbConnect();
    const project = cleanName((await request.json()).project);
    if (!project) return NextResponse.json({ success: false, error: "Project name is required" }, { status: 400 });
    const result = await Plot.deleteMany({ project });
    return NextResponse.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error("DELETE /api/plots/projects error:", error);
    return NextResponse.json({ success: false, error: error.message || "Delete failed" }, { status: 500 });
  }
}
