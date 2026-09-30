import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CampaignVideo from "@/models/CampaignVideo";
import { getSessionUser } from "@/lib/session";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PATCHABLE_FIELDS = ["status", "note", "postedLinks"];

// Moderation (Approve / Suggest Edit / Reject) happens from both the Company
// CP portal (their own network's Digital CPs) and the admin panel.
export async function PATCH(request, { params }) {
  try {
    if (!isAdminRequest(request)) {
      const sessionUser = await getSessionUser(request);
      if (!sessionUser || sessionUser.accountType !== "freelancer" || sessionUser.cpType !== "company") {
        return NextResponse.json({ success: false, error: "Not authorized" }, { status: 401 });
      }
    }

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
