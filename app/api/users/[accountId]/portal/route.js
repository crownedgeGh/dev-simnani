import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Property from "@/models/Property";
import Lead from "@/models/Lead";
import Client from "@/models/Client";
import { getFeaturedProperties, getPropertiesByType, PROPERTIES } from "@/lib/properties";
import { getPropertyById } from "@/lib/propertiesServer";
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

async function getOwnerSnapshot(accountId, { includeCommissions, user }) {
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

  // Leads this account raised as a buyer/enquirer on other owners' listings —
  // i.e. properties they've expressed interest in.
  const interestedLeadDocs = await Lead.find({ buyerId: accountId }).sort({ createdAt: -1 }).lean();
  const interestedPropertyIds = [...new Set(interestedLeadDocs.map((l) => l.propertyId).filter(Boolean))];
  const interestedPropertyDocs = interestedPropertyIds.length
    ? await Property.find({ id: { $in: interestedPropertyIds } }).lean()
    : [];
  const interestedPropertyById = new Map(interestedPropertyDocs.map((p) => [p.id, p]));
  const interested = interestedLeadDocs.map((lead) => {
    const property = interestedPropertyById.get(lead.propertyId);
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

  const stats = {
    activeListings: listings.filter((p) => p.status === "Active").length,
    totalLeads: leads.length,
    siteVisits: leads.filter((l) => l.status === "Site Visit").length,
    closedDeals: user?.dealsClosed ?? 0,
    interested: interested.length,
  };

  return {
    kind: "owner",
    stats,
    listings,
    leads,
    clients,
    interested,
    commissions: includeCommissions ? BROKER_COMMISSIONS : [],
  };
}

// Resolves a user's `savedProperties` id list (set from the public portal's
// heart/save button, see lib/savedProperties.js) into full property tiles.
async function resolveSavedProperties(user) {
  const ids = Array.isArray(user?.savedProperties) ? user.savedProperties : [];
  const resolved = await Promise.all(ids.map((id) => getPropertyById(id)));
  return resolved.filter(Boolean);
}

async function getBuyerSnapshot(accountId, user) {
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

  const saved = await resolveSavedProperties(user);
  const recommended = getFeaturedProperties();

  return {
    kind: "buyer",
    stats: {
      saved: saved.length,
      interested: interested.length,
      recommended: recommended.length,
    },
    recommended,
    interested,
    saved,
    memberSince: user?.registeredDate || "",
  };
}

// Property-category aliases: a handful of investor-facing labels
// (see lib/propertyCategories.js) don't exist as literal `type`/`category`
// values on lib/properties.js listings, so they're mapped to the closest
// browsable equivalent.
const PROPERTY_TYPE_ALIASES = {
  "company-project": "invest",
};

function getMatchingOpportunities(propertyTypes) {
  const wanted = new Set(
    (propertyTypes || []).map((t) => PROPERTY_TYPE_ALIASES[t] || t)
  );
  if (wanted.size === 0) return getPropertiesByType("invest");

  const matched = PROPERTIES.filter((p) => wanted.has(p.type) || wanted.has(p.category));
  return matched.length ? matched : getPropertiesByType("invest");
}

async function getInvestorSnapshot(accountId, user) {
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

  const saved = await resolveSavedProperties(user);
  const opportunities = getMatchingOpportunities(user?.propertyTypes);

  return {
    kind: "investor",
    stats: {
      opportunities: opportunities.length,
      saved: saved.length,
      interested: interested.length,
    },
    opportunities,
    saved,
    interested,
    preferences: {
      propertyTypes: user?.propertyTypes || [],
      budget: user?.budget || "",
      expectedProfit: user?.expectedProfit || "",
      preferredCity: user?.preferredCity || "",
    },
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
        portal = await getOwnerSnapshot(accountId, { includeCommissions: true, user });
        break;
      case "common-person":
        portal = await getOwnerSnapshot(accountId, { includeCommissions: false, user });
        break;
      case "buyer":
        portal = await getBuyerSnapshot(accountId, user);
        break;
      case "investor":
        portal = await getInvestorSnapshot(accountId, user);
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
