import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildLookup(accountId) {
  return {
    $or: [{ accountId }, { _id: accountId.match(/^[0-9a-fA-F]{24}$/) ? accountId : null }],
  };
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { accountId } = await params;

    const user = await User.findOne(buildLookup(accountId)).lean();

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /api/users/[accountId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { accountId } = await params;
    const body = await request.json();

    const updated = await User.findOneAndUpdate(buildLookup(accountId), { $set: body }, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/users/[accountId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { accountId } = await params;
    const body = await request.json();

    const updated = await User.findOneAndUpdate(buildLookup(accountId), { $set: body }, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/users/[accountId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { accountId } = await params;

    const deleted = await User.findOneAndDelete(buildLookup(accountId));

    if (!deleted) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      accountId,
    });
  } catch (error) {
    console.error("DELETE /api/users/[accountId] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
