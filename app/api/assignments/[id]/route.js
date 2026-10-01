import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import { getSessionUser } from "@/lib/session";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// A Field/Digital CP joining or leaving a campaign forwarded to them updates
// their own assignment's status ("In Progress" = joined, "Assigned" = not
// joined / left). Requires a session matching the assignment's own
// assignedToAccountId.
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const existing = await Assignment.findOne({ id }).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }

    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.accountId !== existing.assignedToAccountId) {
      return NextResponse.json(
        { success: false, error: "You can only update your own assignments" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;
    if (!["Assigned", "In Progress", "Completed"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const updated = await Assignment.findOneAndUpdate({ id }, { $set: { status } }, { new: true, runValidators: true }).lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/assignments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update assignment" },
      { status: 500 }
    );
  }
}

// Unassigning a head-to-company forward must also remove whatever the
// Company CP delegated downstream from it (company-to-field /
// company-to-digital assignments chained via parentAssignmentId), so the
// property disappears from every portal it was forwarded into.
export async function DELETE(request, { params }) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    const existing = await Assignment.findOne({ id }).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }

    await Assignment.deleteMany({ parentAssignmentId: id });
    await Assignment.deleteOne({ id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/assignments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove assignment" },
      { status: 500 }
    );
  }
}
