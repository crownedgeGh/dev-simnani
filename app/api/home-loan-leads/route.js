import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import HomeLoanLead from "@/models/HomeLoanLead";
import { isMobileValid } from "@/lib/auth";
import { isAdminRequest } from "@/lib/adminSession";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST — public home loan enquiry, raised from LoanEnquiryModal on /home-loan.
export async function POST(request) {
  try {
    if (isRateLimited(request, { limit: 10, windowMs: 10 * 60 * 1000, key: "home-loan-lead" })) {
      return rateLimitResponse();
    }

    const body = await request.json();
    const name = body.name?.trim();
    const phone = body.phone?.trim();

    if (!name || !isMobileValid(phone || "")) {
      return NextResponse.json(
        { success: false, error: "Enter your name and a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    await dbConnect();

    const lead = await HomeLoanLead.create({
      id: `HL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      phone,
      email: body.email?.trim() || "",
      bankName: body.bankName?.trim() || "",
      bankRate: body.bankRate ?? null,
      loanAmount: body.loanAmount ?? null,
      tenure: body.tenure ?? null,
      age: body.age ?? null,
      propertyIdentified: ["yes", "no"].includes(body.propertyIdentified) ? body.propertyIdentified : "",
      propertyCity: body.propertyCity?.trim() || "",
      propertyCost: body.propertyCost ?? null,
      employmentType: body.employmentType === "self-employed" ? "self-employed" : "salaried",
      income: body.income ?? null,
      currentEmi: body.currentEmi ?? null,
    });

    return NextResponse.json({ success: true, data: { id: lead.id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/home-loan-leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit details" },
      { status: 500 }
    );
  }
}

// GET — admin list.
export async function GET(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();
    const data = await HomeLoanLead.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET /api/home-loan-leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// PATCH — admin status update and/or append a followup/call log entry.
export async function PATCH(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    const { id, status, nextFollowupDate, followup } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    await dbConnect();

    const update = {};
    if (status) update.$set = { ...(update.$set || {}), status };
    if (nextFollowupDate !== undefined) update.$set = { ...(update.$set || {}), nextFollowupDate };
    if (followup?.note?.trim()) {
      update.$push = { followups: { note: followup.note.trim(), outcome: followup.outcome?.trim() || "" } };
    }

    if (!update.$set && !update.$push) {
      return NextResponse.json({ success: false, error: "Nothing to update" }, { status: 400 });
    }

    const updated = await HomeLoanLead.findOneAndUpdate({ id }, update, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/home-loan-leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update lead" },
      { status: 500 }
    );
  }
}
