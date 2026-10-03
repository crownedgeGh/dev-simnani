import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { isPasswordValid, isMobileValid } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Admin-only user directory (mobile/email/RERA number for every account) —
// registration (POST, below) stays open to unauthenticated visitors.
export async function GET(request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const accountType = searchParams.get("accountType");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query = {};

    if (accountType && accountType !== "all") {
      query.accountType = accountType;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { accountId: { $regex: search, $options: "i" } },
        { "skills.subcategory": { $regex: search, $options: "i" } },
        { "skills.category": { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    if (!body.fullName || !body.mobile || !body.accountType) {
      return NextResponse.json(
        { success: false, error: "fullName, mobile and accountType are required" },
        { status: 400 }
      );
    }

    if (!isMobileValid(body.mobile)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    if (body.accountType === "broker" && body.reraRegistered === true && !body.reraNumber?.trim()) {
      return NextResponse.json(
        { success: false, error: "RERA registration number is required for brokers" },
        { status: 400 }
      );
    }

    if (!isPasswordValid(body.password)) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ mobile: body.mobile }).lean();
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this mobile number already exists. Please log in instead." },
        { status: 409 }
      );
    }

    const accountId = body.accountId || `SG-USR-${Date.now()}`;
    const { confirmPassword, ...rest } = body;

    const userData = {
      ...rest,
      accountId,
      password: await hashPassword(body.password),
      status: body.status || "Active",
      registeredDate:
        body.registeredDate ||
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    };

    if (body.dealsClosed !== undefined) {
      userData.dealsClosed = Math.max(0, Number(body.dealsClosed) || 0);
    }

    if (Array.isArray(body.skills)) {
      userData.skills = body.skills
        .map((s) => ({
          category: (s.category || "").trim(),
          subcategory: (s.subcategory || s.name || "").trim(),
        }))
        .filter((s) => s.subcategory);
    }

    const newUser = await User.create(userData);
    const { password, ...safeUser } = newUser.toObject();

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      const isMobileDupe = Boolean(error.keyPattern?.mobile);
      return NextResponse.json(
        {
          success: false,
          error: isMobileDupe
            ? "An account with this mobile number already exists. Please log in instead."
            : "An account with this ID already exists",
        },
        { status: 409 }
      );
    }
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
