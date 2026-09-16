import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Property from "@/models/Property";
import Lead from "@/models/Lead";
import Client from "@/models/Client";
import { getFeaturedProperties, getPropertiesByType } from "@/lib/properties";
import { DEMO_USER, SAVED_PROPERTY_IDS, SUPPORT_TICKETS } from "@/lib/demoAccount";
import {
  BROKER_COMMISSIONS,
  CP_LEADS,
  CP_NETWORK,
  CP_COMMISSIONS,
  CP_SITE_VISITS,
  CP_STATS,
} from "@/lib/demoPortal";
import {
  EMPLOYEE_STATS,
  EMPLOYEE_LEADS,
  SITE_VISITS,
  SALES_TARGET,
  PERFORMANCE,
  TERRITORY,
} from "@/lib/demoEmployeePortal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildLookup(accountId) {
  return {
    $or: [{ accountId }, { _id: accountId.match(/^[0-9a-fA-F]{24}$/) ? accountId : null }],
  };
}

async function getOwnerSnapshot(accountId, { includeCommissions }) {
  await dbConnect();

  const docs = await Property.find({ ownerId: accountId }).sort({ createdAt: -1 }).lean();
  const listings = docs.map((doc) => ({ ...doc, _id: doc._id.toString() }));

  const leadDocs = await Lead.find({ ownerId: accountId }).sort({ createdAt: -1 }).lean();
  const leads = leadDocs.map((doc) => ({ ...doc, _id: doc._id.toString() }));

  const clientDocs = await Client.find({ ownerId: accountId }).sort({ createdAt: -1 }).lean();
  const titleToPropertyId = new Map(listings.map((p) => [p.title, p.id]));
  const clients = clientDocs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
    propertyId: doc.propertyId || titleToPropertyId.get(doc.property) || "",
  }));

  const stats = {
    activeListings: listings.filter((p) => p.status === "Active").length,
    totalLeads: leads.length,
    siteVisits: leads.filter((l) => l.status === "Site Visit").length,
    closedDeals: 0,
  };

  return {
    kind: "owner",
    stats,
    listings,
    leads,
    clients,
    commissions: includeCommissions ? BROKER_COMMISSIONS : [],
  };
}

async function getBuyerSnapshot(accountId) {
  await dbConnect();

  const leadDocs = await Lead.find({ buyerId: accountId }).sort({ createdAt: -1 }).lean();
  const propertyIds = [...new Set(leadDocs.map((l) => l.propertyId).filter(Boolean))];
  const propertyDocs = propertyIds.length
    ? await Property.find({ id: { $in: propertyIds } }).lean()
    : [];
  const propertyById = new Map(propertyDocs.map((p) => [p.id, p]));

  const interested = leadDocs.map((lead) => {
    const property = propertyById.get(lead.propertyId);
    return {
      id: lead.propertyId,
      title: property?.title || lead.interest || lead.propertyId,
      location: property?.location || "",
      price: property?.price || "",
      image: property?.image || "",
      status: lead.status,
      date: lead.date,
    };
  });

  return {
    kind: "buyer",
    stats: {
      savedProperties: SAVED_PROPERTY_IDS.length,
      recentlyViewed: 12,
      enquiries: interested.length,
    },
    recommended: getFeaturedProperties(),
    interested,
    memberSince: DEMO_USER.memberSince,
  };
}

function getInvestorSnapshot() {
  const opportunities = getPropertiesByType("invest");
  return {
    kind: "investor",
    stats: {
      opportunities: opportunities.length,
      savedOpportunities: SAVED_PROPERTY_IDS.length,
      enquiries: SUPPORT_TICKETS.length,
    },
    opportunities,
  };
}

function getEmployeeSnapshot() {
  return {
    kind: "employee",
    stats: EMPLOYEE_STATS,
    leads: EMPLOYEE_LEADS,
    siteVisits: SITE_VISITS,
    salesTarget: SALES_TARGET,
    performance: PERFORMANCE,
    territory: TERRITORY,
  };
}

function getFreelancerSnapshot() {
  return {
    kind: "freelancer",
    stats: CP_STATS,
    leads: CP_LEADS,
    network: CP_NETWORK,
    commissions: CP_COMMISSIONS,
    siteVisits: CP_SITE_VISITS,
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

    let portal;
    switch (user.accountType) {
      case "broker":
        portal = await getOwnerSnapshot(accountId, { includeCommissions: true });
        break;
      case "common-person":
        portal = await getOwnerSnapshot(accountId, { includeCommissions: false });
        break;
      case "buyer":
        portal = await getBuyerSnapshot(accountId);
        break;
      case "investor":
        portal = getInvestorSnapshot();
        break;
      case "employee":
        portal = getEmployeeSnapshot();
        break;
      case "freelancer":
        portal = getFreelancerSnapshot();
        break;
      default:
        portal = { kind: "unknown" };
    }

    return NextResponse.json({ success: true, accountType: user.accountType, data: portal });
  } catch (error) {
    console.error("GET /api/users/[accountId]/portal error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch portal data" },
      { status: 500 }
    );
  }
}
