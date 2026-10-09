import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import DeletedAccount from "@/models/DeletedAccount";
import Property from "@/models/Property";
import Client from "@/models/Client";
import Lead from "@/models/Lead";
import CpLead from "@/models/CpLead";
import Subscription from "@/models/Subscription";
import Assignment from "@/models/Assignment";
import Commission from "@/models/Commission";
import SiteVisit from "@/models/SiteVisit";
import { getSessionUser, clearSessionCookie } from "@/lib/session";
import { verifyPassword } from "@/lib/password";
import { verifyOtp } from "@/lib/otp";
import { isRateLimited, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Self-service account deletion, gated by re-proving identity via password
// or OTP (mirrors the login-password / login-otp verification already used
// elsewhere). Hard-deletes the user's full data from the live collections —
// so their mobile number is free and they must sign up fresh to come back —
// after archiving a full snapshot (profile + everything they owned) into
// DeletedAccount for the admin "Deleted Accounts" panel.
export async function POST(request) {
  try {
    if (isRateLimited(request, { limit: 5, windowMs: 10 * 60 * 1000, key: "delete-account" })) {
      return rateLimitResponse();
    }

    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { method, password, otp } = await request.json();
    const digits = (sessionUser.mobile || "").replace(/\D/g, "").slice(-10);

    await dbConnect();

    if (method === "password") {
      if (!password) {
        return NextResponse.json({ success: false, error: "Enter your password" }, { status: 400 });
      }
      const full = await User.findOne({ accountId: sessionUser.accountId }).select("+password").lean();
      if (!full?.password) {
        return NextResponse.json(
          { success: false, error: "No password set for this account. Please verify with OTP instead." },
          { status: 400 }
        );
      }
      if (!(await verifyPassword(password, full.password))) {
        return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
      }
    } else if (method === "otp") {
      if (!otp) {
        return NextResponse.json({ success: false, error: "Enter the OTP sent to your mobile" }, { status: 400 });
      }
      const verification = await verifyOtp(digits, "delete-account", otp);
      if (!verification.valid) {
        return NextResponse.json({ success: false, error: verification.error }, { status: 401 });
      }
    } else {
      return NextResponse.json({ success: false, error: "Invalid verification method" }, { status: 400 });
    }

    const accountId = sessionUser.accountId;
    const ownerQuery = { ownerId: accountId };
    const accountQuery = { accountId };
    const cpAssignedQuery = { $or: [{ assignedByAccountId: accountId }, { assignedToAccountId: accountId }] };

    const [userDoc, properties, clients, leads, cpLeads, subscriptions, assignments, commissions, siteVisits] =
      await Promise.all([
        User.findOne({ accountId }).lean(),
        Property.find(ownerQuery).lean(),
        Client.find(ownerQuery).lean(),
        Lead.find(ownerQuery).lean(),
        CpLead.find(accountQuery).lean(),
        Subscription.find(accountQuery).lean(),
        Assignment.find(cpAssignedQuery).lean(),
        Commission.find({ cpAccountId: accountId }).lean(),
        SiteVisit.find({ fieldCpAccountId: accountId }).lean(),
      ]);

    const { password: _password, ...userSnapshot } = userDoc || {};

    await DeletedAccount.create({
      accountId,
      fullName: sessionUser.fullName,
      mobile: sessionUser.mobile,
      email: sessionUser.email,
      accountType: sessionUser.accountType,
      snapshot: { user: userSnapshot, properties, clients, leads, cpLeads, subscriptions, assignments, commissions, siteVisits },
    });

    await Promise.all([
      User.deleteOne({ accountId }),
      Property.deleteMany(ownerQuery),
      Client.deleteMany(ownerQuery),
      Lead.deleteMany(ownerQuery),
      CpLead.deleteMany(accountQuery),
      Subscription.deleteMany(accountQuery),
      Assignment.deleteMany(cpAssignedQuery),
      Commission.deleteMany({ cpAccountId: accountId }),
      SiteVisit.deleteMany({ fieldCpAccountId: accountId }),
      Session.deleteMany(accountQuery),
    ]);

    const res = NextResponse.json({ success: true, message: "Account deleted" });
    clearSessionCookie(res);
    return res;
  } catch (error) {
    console.error("POST /api/account/delete error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
