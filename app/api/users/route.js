import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
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
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).lean();

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

    const accountId = body.accountId || `SG-USR-${Date.now()}`;

    const userData = {
      ...body,
      accountId,
      status: body.status || "Active",
      registeredDate:
        body.registeredDate ||
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    };

    const newUser = await User.create(userData);

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "An account with this ID already exists" },
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
