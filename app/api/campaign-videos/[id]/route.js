import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CampaignVideo from "@/models/CampaignVideo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PATCHABLE_FIELDS = ["status", "note", "postedLinks"];

// Moderation (Approve / Suggest Edit / Reject) happens from both the Company
// CP portal (their own network's Digital CPs) and the admin panel — neither
// carries a strict ownership check today, matching the trust model of the
// rest of the CP admin surface.
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const body = await request.json();
    const update = {};
    for (const key of PATCHABLE_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const updated = await CampaignVideo.findOneAndUpdate({ id }, { $set: update }, { new: true, runValidators: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, error: "Campaign video not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/campaign-videos/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update campaign video" },
      { status: 500 }
    );
  }
}
