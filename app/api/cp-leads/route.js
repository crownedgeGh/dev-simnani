import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CpLead from "@/models/CpLead";
import { getSessionUser } from "@/lib/session";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// The admin panel needs to query across any CP's leads by routingStage; the
// portal always scopes its own query by submittedByAccountId. Anyone else —
// including a logged-in CP passing someone else's accountId or a bare
// routingStage query — is rejected.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const routingStage = searchParams.get("routingStage");
    const submittedByAccountId = searchParams.get("submittedByAccountId");
    const adLinkId = searchParams.get("adLinkId");
    const forwarded = searchParams.get("forwarded");

    if (!isAdminRequest(request)) {
      const sessionUser = await getSessionUser(request);
      if (!sessionUser || !submittedByAccountId || submittedByAccountId !== sessionUser.accountId) {
        return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
      }
    }

    await dbConnect();

    const query = {};
    if (routingStage) query.routingStage = routingStage;
    if (submittedByAccountId) query["submittedBy.accountId"] = submittedByAccountId;
    if (adLinkId) query.adLinkId = adLinkId;
    if (forwarded !== null && forwarded !== undefined && forwarded !== "") {
      query.forwarded = forwarded === "true";
    }

    const leads = await CpLead.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    console.error("GET /api/cp-leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch CP leads" },
      { status: 500 }
    );
  }
}

// Creates a draft lead — a Digital CP logging a lead under an ad link, or a
// Field CP logging a direct lead. Requires a logged-in Digital/Field CP
// session; the lead starts unforwarded and only enters the shared pipeline
// once PATCHed with forwarded:true.
export async function POST(request) {
  try {
    await dbConnect();

    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.accountType !== "freelancer" || !["digital", "field"].includes(sessionUser.cpType)) {
      return NextResponse.json(
        { success: false, error: "You must be logged in as a Digital or Field CP to add a lead" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { customer, phone, project, projectId, source, notes, adLinkId } = body;

    if (!customer || !customer.trim()) {
      return NextResponse.json({ success: false, error: "Customer name is required" }, { status: 400 });
    }

    const id = `CPL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const lead = await CpLead.create({
      id,
      customer: customer.trim(),
      phone: phone || "",
      project: project || "",
      projectId: projectId || "",
      source: source || "",
      submittedBy: {
        cpType: sessionUser.cpType,
        name: sessionUser.fullName,
        accountId: sessionUser.accountId,
      },
      routingStage: `${sessionUser.cpType}-cp`,
      forwarded: false,
      adLinkId: adLinkId || "",
      notes: notes || "",
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "This lead already exists" }, { status: 409 });
    }
    console.error("POST /api/cp-leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add lead" },
      { status: 500 }
    );
  }
}
