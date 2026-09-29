import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Commission from "@/models/Commission";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Admin-only surface (created automatically when a lead converts, managed
// from the CP Management Commissions tab) — unauthenticated like the rest of
// /api/admin/*-adjacent CP routes.
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const cpType = searchParams.get("cpType");
    const leadId = searchParams.get("leadId");
    const cpAccountId = searchParams.get("cpAccountId");

    const query = {};
    if (cpType) query.cpType = cpType;
    if (leadId) query.leadId = leadId;
    if (cpAccountId) query.cpAccountId = cpAccountId;

    const commissions = await Commission.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, count: commissions.length, data: commissions });
  } catch (error) {
    console.error("GET /api/commissions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch commissions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { leadId, customer, project, cpType, cpAccountId } = body;

    if (!leadId) {
      return NextResponse.json({ success: false, error: "leadId is required" }, { status: 400 });
    }

    const id = `COM-${Date.now()}`;
    const commission = await Commission.create({
      id,
      leadId,
      customer: customer || "",
      project: project || "",
      amount: "Pending",
      approvalStatus: "Pending",
      source: "CP",
      type: "channel-partner",
      cpType: cpType || "",
      cpAccountId: cpAccountId || "",
    });

    return NextResponse.json({ success: true, data: commission }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "A commission for this lead already exists" }, { status: 409 });
    }
    console.error("POST /api/commissions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create commission" },
      { status: 500 }
    );
  }
}
