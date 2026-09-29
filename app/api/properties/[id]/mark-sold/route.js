import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Assignment from "@/models/Assignment";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Lets a Company CP mark a property Head CP handed down to them as Sold, or
// reopen it. Unlike /api/properties/[id] this isn't gated by ownerId — a
// Company CP never owns the listing, they only hold a head-to-company
// Assignment on it — so eligibility is checked against that instead.
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.accountType !== "freelancer" || sessionUser.cpType !== "company") {
      return NextResponse.json(
        { success: false, error: "You must be logged in as a Company CP" },
        { status: 401 }
      );
    }

    const assignment = await Assignment.findOne({
      propertyId: id,
      level: "head-to-company",
      assignedToAccountId: sessionUser.accountId,
    }).lean();

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "This property was not assigned to you by Head CP" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const status = body.sold ? "Sold" : "Active";

    const updated = await Property.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/buy");
    revalidatePath("/rent");
    revalidatePath("/sell");
    revalidatePath("/invest");
    revalidatePath(`/property/${id}`);

    return NextResponse.json({
      success: true,
      message: status === "Sold" ? "Property marked as sold" : "Property reopened",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/properties/[id]/mark-sold error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update property" },
      { status: 500 }
    );
  }
}
