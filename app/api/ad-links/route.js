import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AdLink from "@/models/AdLink";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const digitalCpAccountId = searchParams.get("digitalCpAccountId");

    const query = {};
    if (digitalCpAccountId) query.digitalCpAccountId = digitalCpAccountId;

    const links = await AdLink.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, count: links.length, data: links });
  } catch (error) {
    console.error("GET /api/ad-links error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch ad links" },
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
        { success: false, error: "You must be logged in as a Digital CP to add an ad link" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { platform, link } = body;
    if (!platform || !link || !link.trim()) {
      return NextResponse.json({ success: false, error: "Platform and link are required" }, { status: 400 });
    }

    const id = `LNK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const adLink = await AdLink.create({
      id,
      digitalCpAccountId: sessionUser.accountId,
      platform,
      link: link.trim(),
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    });

    return NextResponse.json({ success: true, data: adLink }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ad-links error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add ad link" },
      { status: 500 }
    );
  }
}
