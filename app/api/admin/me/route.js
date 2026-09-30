import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  return NextResponse.json({ authenticated: isAdminRequest(request) });
}
