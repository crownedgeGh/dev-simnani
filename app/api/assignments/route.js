import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import Property from "@/models/Property";
import User from "@/models/User";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CHILD_CP_TYPE_FOR_LEVEL = {
  "head-to-company": "company",
  "company-to-field": "field",
  "company-to-digital": "digital",
};

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const assignedToAccountId = searchParams.get("assignedToAccountId");
    const assignedByAccountId = searchParams.get("assignedByAccountId");
    const parentAssignmentId = searchParams.get("parentAssignmentId");
    const propertyId = searchParams.get("propertyId");

    const query = {};
    if (level) query.level = level;
    if (assignedToAccountId) query.assignedToAccountId = assignedToAccountId;
    if (assignedByAccountId) query.assignedByAccountId = assignedByAccountId;
    if (parentAssignmentId) query.parentAssignmentId = parentAssignmentId;
    if (propertyId) query.propertyId = propertyId;

    const assignments = await Assignment.find(query).sort({ createdAt: -1 }).lean();

    // Attach each property's current status so downstream CP portals can
    // show "Sold Out" once the Company CP marks the property sold — the
    // Assignment record itself never changes on a sale.
    const propertyIds = [...new Set(assignments.map((a) => a.propertyId))];
    const properties = propertyIds.length
      ? await Property.find({ id: { $in: propertyIds } }, { id: 1, status: 1 }).lean()
      : [];
    const statusByPropertyId = Object.fromEntries(properties.map((p) => [p.id, p.status]));
    const enriched = assignments.map((a) => ({
      ...a,
      propertyStatus: statusByPropertyId[a.propertyId] || "Active",
    }));

    return NextResponse.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    console.error("GET /api/assignments error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// Creates one leg of the forwarding chain:
//   Head CP -> Company CP        (level: "head-to-company", no session — the
//                                  admin panel has no CP account of its own)
//   Company CP -> Field/Digital  (level: "company-to-field" / "-digital",
//                                  requires a real logged-in Company CP session)
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { propertyId, propertyTitle, propertyImage, propertyLocation, level, assignedToAccountId, parentAssignmentId } = body;

    if (!propertyId || !level || !assignedToAccountId) {
      return NextResponse.json(
        { success: false, error: "propertyId, level and assignedToAccountId are required" },
        { status: 400 }
      );
    }

    const expectedCpType = CHILD_CP_TYPE_FOR_LEVEL[level];
    if (!expectedCpType) {
      return NextResponse.json({ success: false, error: "Invalid assignment level" }, { status: 400 });
    }

    const targetUser = await User.findOne({ accountId: assignedToAccountId }).lean();
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Target CP account not found" }, { status: 404 });
    }
    if (targetUser.cpType !== expectedCpType) {
      return NextResponse.json(
        { success: false, error: `Target account is not a ${expectedCpType} CP` },
        { status: 400 }
      );
    }

    let assignedByAccountId = "";
    let assignedByName = "Head CP";
    let assignedByCpType = "head";
    let assignedByCity = "";
    let assignedByState = "";

    if (level === "head-to-company") {
      // The admin/Head CP panel authenticates separately (single implicit
      // super-admin) and has no session cookie of its own — trusted here the
      // same way the rest of /api/admin/* is trusted from the admin UI.
    } else {
      const sessionUser = await getSessionUser(request);
      if (sessionUser && sessionUser.accountType === "freelancer" && sessionUser.cpType === "company") {
        assignedByAccountId = sessionUser.accountId;
        assignedByName = sessionUser.fullName;
        assignedByCpType = "company";
        assignedByCity = sessionUser.city || "";
        assignedByState = sessionUser.state || "";

        if (parentAssignmentId) {
          const parent = await Assignment.findOne({ id: parentAssignmentId }).lean();
          if (!parent || parent.assignedToAccountId !== sessionUser.accountId || parent.level !== "head-to-company") {
            return NextResponse.json(
              { success: false, error: "This property was not assigned to you by Head CP" },
              { status: 403 }
            );
          }
        }
      } else if (body.assignedByAccountId) {
        // No Company CP session — this is the admin panel delegating on a
        // Company CP's behalf (Company CP Management's "Delegate" action).
        // Trusted like head-to-company, but still resolves the real account
        // so assignedByName/city/state aren't client-supplied.
        const delegator = await User.findOne({ accountId: body.assignedByAccountId, cpType: "company" }).lean();
        if (!delegator) {
          return NextResponse.json({ success: false, error: "Delegating Company CP account not found" }, { status: 404 });
        }
        assignedByAccountId = delegator.accountId;
        assignedByName = delegator.fullName;
        assignedByCpType = "company";
        assignedByCity = delegator.city || "";
        assignedByState = delegator.state || "";
      } else {
        return NextResponse.json(
          { success: false, error: "You must be logged in as a Company CP to delegate" },
          { status: 401 }
        );
      }
    }

    const id = `SG-ASG-${Date.now()}`;
    const assignment = await Assignment.create({
      id,
      propertyId,
      propertyTitle: propertyTitle || "",
      propertyImage: propertyImage || "",
      propertyLocation: propertyLocation || "",
      level,
      assignedByCpType,
      assignedByAccountId,
      assignedByName,
      assignedByCity,
      assignedByState,
      assignedToCpType: targetUser.cpType,
      assignedToAccountId: targetUser.accountId,
      assignedToName: targetUser.fullName,
      assignedToCity: targetUser.city || "",
      assignedToState: targetUser.state || "",
      parentAssignmentId: parentAssignmentId || null,
    });

    return NextResponse.json(
      { success: true, message: "Property forwarded successfully", data: assignment },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "This assignment already exists" }, { status: 409 });
    }
    console.error("POST /api/assignments error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to forward property" },
      { status: 500 }
    );
  }
}
