import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Commission from "@/models/Commission";
import Assignment from "@/models/Assignment";
import { getSessionUser } from "@/lib/session";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Admin-managed from the CP Management Commissions tab — gated by the real
// server-side admin session. A Company CP may instead pass
// `delegatedByAccountId=<self>` to see commissions earned by every
// Field/Digital CP it has delegated a project to (verified via the
// Assignment table).
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cpType = searchParams.get("cpType");
    const leadId = searchParams.get("leadId");
    const cpAccountId = searchParams.get("cpAccountId");
    const delegatedByAccountId = searchParams.get("delegatedByAccountId");

    let cpAccountIds = null;

    if (!isAdminRequest(request)) {
      const sessionUser = await getSessionUser(request);
      if (!sessionUser || !delegatedByAccountId || delegatedByAccountId !== sessionUser.accountId) {
        return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
      }
      await dbConnect();
      const delegations = await Assignment.find({
        level: { $in: ["company-to-field", "company-to-digital"] },
        assignedByAccountId: delegatedByAccountId,
      })
        .select("assignedToAccountId")
        .lean();
      cpAccountIds = [...new Set(delegations.map((d) => d.assignedToAccountId))];
    }

    await dbConnect();

    const query = {};
    if (cpType) query.cpType = cpType;
    if (leadId) query.leadId = leadId;
    if (cpAccountIds) query.cpAccountId = { $in: cpAccountIds };
    else if (cpAccountId) query.cpAccountId = cpAccountId;

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
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

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
