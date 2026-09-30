import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CampaignVideo from "@/models/CampaignVideo";
import { getSessionUser } from "@/lib/session";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Any authenticated CP can browse available campaign videos (no PII in the
// response — just name/url fields); admin sees everything too. Never public.
export async function GET(request) {
  try {
    if (!isAdminRequest(request)) {
      const sessionUser = await getSessionUser(request);
      if (!sessionUser) {
        return NextResponse.json({ success: false, error: "You must be logged in" }, { status: 401 });
      }
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const partnerAccountId = searchParams.get("partnerAccountId");

    const query = {};
    if (partnerAccountId) query.partnerAccountId = partnerAccountId;

    const videos = await CampaignVideo.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, count: videos.length, data: videos });
  } catch (error) {
    console.error("GET /api/campaign-videos error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch campaign videos" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.accountType !== "freelancer" || sessionUser.cpType !== "digital") {
      return NextResponse.json(
        { success: false, error: "You must be logged in as a Digital CP to submit a campaign video" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { project, projectId, videoName, videoUrl } = body;

    const id = `VID-${Date.now()}`;
    const video = await CampaignVideo.create({
      id,
      partnerAccountId: sessionUser.accountId,
      partnerName: sessionUser.fullName,
      project: project || "",
      projectId: projectId || "",
      videoName: videoName || "",
      videoUrl: videoUrl || "",
    });

    return NextResponse.json({ success: true, data: video }, { status: 201 });
  } catch (error) {
    console.error("POST /api/campaign-videos error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit campaign video" },
      { status: 500 }
    );
  }
}
