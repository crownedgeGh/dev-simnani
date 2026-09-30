import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { isPasswordValid } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { getSessionUser } from "@/lib/session";
import { isAdminRequest } from "@/lib/adminSession";

// Every handler below reads/writes one user's full record (mobile, email,
// RERA number, and — on PUT/PATCH — password) or deletes the account
// outright, so each one must confirm the caller either owns this accountId
// or holds an admin session before touching anything.
async function canAccessAccount(request, accountId) {
  if (isAdminRequest(request)) return true;
  const sessionUser = await getSessionUser(request);
  return !!sessionUser && sessionUser.accountId === accountId;
}

async function preparePatch(body) {
  const { confirmPassword, ...rest } = body;
  if (!rest.password) {
    delete rest.password;
    return rest;
  }
  if (!isPasswordValid(rest.password)) {
    throw new Error("Password must be at least 8 characters");
  }
  rest.password = await hashPassword(rest.password);
  if (rest.dealsClosed !== undefined) {
    rest.dealsClosed = Math.max(0, Number(rest.dealsClosed) || 0);
  }
  if (Array.isArray(rest.skills)) {
    rest.skills = rest.skills
      .map((s) => ({
        category: (s.category || "").trim(),
        subcategory: (s.subcategory || s.name || "").trim(),
      }))
      .filter((s) => s.subcategory);
  }
  return rest;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildLookup(accountId) {
  return {
    $or: [{ accountId }, { _id: accountId.match(/^[0-9a-fA-F]{24}$/) ? accountId : null }],
  };
}

export async function GET(request, { params }) {
  try {
    const { accountId } = await params;
    if (!(await canAccessAccount(request, accountId))) {
      return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
    }

    await dbConnect();

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
    const { accountId } = await params;
    if (!(await canAccessAccount(request, accountId))) {
      return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
    }

    await dbConnect();
    const body = await preparePatch(await request.json());

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
    const { accountId } = await params;
    if (!(await canAccessAccount(request, accountId))) {
      return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
    }

    await dbConnect();
    const body = await preparePatch(await request.json());

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
    const { accountId } = await params;
    if (!(await canAccessAccount(request, accountId))) {
      return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
    }

    await dbConnect();

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
