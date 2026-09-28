import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SiteVisit from "@/models/SiteVisit";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PATCHABLE_FIELDS = [
  "status",
  "movingAt",
  "photoAt",
  "doneAt",
  "noShowAt",
  "livePhotos",
  "notes",
  "submitted",
  "submittedAt",
  "customer",
  "phone",
  "followUps",
];

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
    }

    const existing = await SiteVisit.findOne({ id }).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Site visit not found" }, { status: 404 });
    }
    if (existing.fieldCpAccountId !== sessionUser.accountId) {
      return NextResponse.json(
        { success: false, error: "You can only update your own site visits" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const update = {};
    for (const key of PATCHABLE_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const updated = await SiteVisit.findOneAndUpdate({ id }, { $set: update }, { new: true, runValidators: true }).lean();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/site-visits/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update site visit" },
      { status: 500 }
    );
  }
}
