import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DeletedAccount from "@/models/DeletedAccount";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

// Archive of self-deleted accounts (hard-deleted from User, see
// /api/account/delete) — admin-only, read-only record of who deleted their
// account and what data they had at the time.
export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
  }

  await dbConnect();
  const records = await DeletedAccount.find({}).sort({ deletedAt: -1 }).lean();

  return NextResponse.json({ success: true, count: records.length, data: records });
}
