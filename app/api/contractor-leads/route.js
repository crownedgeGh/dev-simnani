import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ContractorLead from "@/models/ContractorLead";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { isMobileValid } from "@/lib/auth";
import { isAdminRequest } from "@/lib/adminSession";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";
import {
  SERVICE_PROVIDER_TYPE_VALUES,
  getServiceTypeLabel,
} from "@/lib/serviceProviders";
import { verifyTurnstile } from "@/lib/turnstile";

// Escape before building a RegExp — city/state arrive from the client.
const exactly = (v) =>
  new RegExp(`^${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

// Routes the request straight into the matching contractor(s)' own portal
// lead list — city match first, falling back to the rest of the state so a
// request never reaches a provider outside that city/state.
async function routeToMatchingProviders({ name, phone, city, state, serviceType, requirement }) {
  const base = { accountType: "service-provider", status: "Active", serviceType };
  const find = (extra) =>
    User.find({ ...base, ...extra }).select("accountId city").lean();

  const matches = city
    ? await find({ city: exactly(city) })
    : [];
  const providers = matches.length || !state ? matches : await find({ state: exactly(state) });

  await Promise.all(
    providers.map((provider, i) =>
      Lead.create({
        id: `LD-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
        name,
        phone,
        address: [city, state].filter(Boolean).join(", "),
        interest: `${getServiceTypeLabel(serviceType)} request`,
        requirement,
        ownerId: provider.accountId,
        source: "Service Request",
      }),
    ),
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST — public callback request raised from a service-provider section.
export async function POST(request) {
  try {
    if (
      isRateLimited(request, {
        limit: 10,
        windowMs: 10 * 60 * 1000,
        key: "contractor-lead",
      })
    ) {
      return rateLimitResponse();
    }

    const {
      name,
      phone,
      bestTime,
      serviceType,
      sourcePath,
      requirement,
      turnstileToken,
      city,
      state,
    } = await request.json();

    if (!(await verifyTurnstile(turnstileToken, request))) {
      return NextResponse.json(
        { success: false, error: "Verification failed. Please try again." },
        { status: 400 },
      );
    }

    if (!name?.trim() || !isMobileValid(phone || "")) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter your name and a valid 10-digit mobile number",
        },
        { status: 400 },
      );
    }
    if (!SERVICE_PROVIDER_TYPE_VALUES.includes(serviceType)) {
      return NextResponse.json(
        { success: false, error: "Valid serviceType is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const trimmedCity = (city || "").trim();
    const trimmedState = (state || "").trim();
    const trimmedRequirement = (requirement || "").trim().slice(0, 1000);

    const lead = await ContractorLead.create({
      id: `CB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      phone: phone.trim(),
      bestTime: ["morning", "afternoon", "evening"].includes(bestTime)
        ? bestTime
        : "",
      serviceType,
      sourcePath: (sourcePath || "").trim().slice(0, 200),
      requirement: trimmedRequirement,
      city: trimmedCity,
      state: trimmedState,
    });

    await routeToMatchingProviders({
      name: name.trim(),
      phone: phone.trim(),
      city: trimmedCity,
      state: trimmedState,
      serviceType,
      requirement: trimmedRequirement,
    });

    return NextResponse.json(
      { success: true, data: { id: lead.id } },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/contractor-leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit request" },
      { status: 500 },
    );
  }
}

// GET — admin list, optionally scoped to one service provider role.
export async function GET(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 },
      );
    }

    await dbConnect();

    const serviceType = new URL(request.url).searchParams.get("serviceType");
    const query =
      serviceType && SERVICE_PROVIDER_TYPE_VALUES.includes(serviceType)
        ? { serviceType }
        : {};

    const data = await ContractorLead.find(query)
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("GET /api/contractor-leads error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch contractor leads",
      },
      { status: 500 },
    );
  }
}

// PATCH — admin status / notes update.
export async function PATCH(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 },
      );
    }

    const { id, status, adminNotes } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const patch = {};
    if (status) patch.status = status;
    if (adminNotes !== undefined) patch.adminNotes = adminNotes;

    const updated = await ContractorLead.findOneAndUpdate(
      { id },
      { $set: patch },
      { new: true },
    ).lean();
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/contractor-leads error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update lead" },
      { status: 500 },
    );
  }
}
