import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SiteVisit from "@/models/SiteVisit";
import { getSessionUser } from "@/lib/session";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// The admin panel needs to look up any Field CP's visits by their accountId
// (see /api/admin/field-cps); the Field CP portal itself always passes its
// own accountId. Anyone else — including a logged-in CP passing someone
// else's accountId — is rejected.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fieldCpAccountId = searchParams.get("fieldCpAccountId");

    if (!isAdminRequest(request)) {
      const sessionUser = await getSessionUser(request);
      if (!sessionUser || !fieldCpAccountId || fieldCpAccountId !== sessionUser.accountId) {
        return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
      }
    }

    await dbConnect();

    const query = {};
    if (fieldCpAccountId) query.fieldCpAccountId = fieldCpAccountId;

    const siteVisits = await SiteVisit.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, count: siteVisits.length, data: siteVisits });
  } catch (error) {
    console.error("GET /api/site-visits error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch site visits" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.accountType !== "freelancer" || sessionUser.cpType !== "field") {
      return NextResponse.json(
        { success: false, error: "You must be logged in as a Field CP to schedule a site visit" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { project, projectId, customer, phone, scheduledAt } = body;

    const id = `SG-VISIT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const siteVisit = await SiteVisit.create({
      id,
      fieldCpAccountId: sessionUser.accountId,
      projectId: projectId || "",
      project: project || "",
      customer: customer || "",
      phone: phone || "",
      scheduledAt: scheduledAt || "",
    });

    return NextResponse.json(
      { success: true, message: "Site visit scheduled", data: siteVisit },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "This site visit already exists" }, { status: 409 });
    }
    console.error("POST /api/site-visits error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to schedule site visit" },
      { status: 500 }
    );
  }
}
