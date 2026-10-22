import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Lead from "@/models/Lead";
import Client from "@/models/Client";
import User from "@/models/User";
import { getListingLimit } from "@/lib/properties";

// Notes saved before notes._id was disabled on the schema still carry an
// ObjectId per entry, which Next.js refuses to pass from a Server to a
// Client Component — strip it down to the plain fields the UI uses.
function sanitizeNotes(notes) {
  if (!Array.isArray(notes)) return [];
  return notes.map((n) => ({ text: n.text, date: n.date }));
}

export async function getOwnerPortalData(ownerId) {
  await dbConnect();

  const user = await User.findOne({ accountId: ownerId }).lean();
  const closedDeals = user?.dealsClosed ?? 0;

  const docs = await Property.find({ ownerId }).sort({ createdAt: -1 }).lean();
  const listings = JSON.parse(JSON.stringify(docs));

  const leadDocs = await Lead.find({ ownerId }).sort({ createdAt: -1 }).lean();
  const leads = JSON.parse(JSON.stringify(leadDocs)).map((doc) => ({
    ...doc,
    notes: sanitizeNotes(doc.notes),
  }));

  const clientDocs = await Client.find({ ownerId }).sort({ createdAt: -1 }).lean();
  const titleToPropertyId = new Map(listings.map((p) => [p.title, p.id]));
  const clients = JSON.parse(JSON.stringify(clientDocs)).map((doc) => ({
    ...doc,
    notes: sanitizeNotes(doc.notes),
    propertyId: doc.propertyId || titleToPropertyId.get(doc.property) || "",
  }));

  const listingLimit = getListingLimit(user?.accountType, user?.topupCredits);

  const stats = {
    activeListings: listings.filter((p) => p.status === "Active").length,
    totalLeads: leads.length,
    siteVisits: leads.filter((l) => l.status === "Site Visit").length,
    closedDeals,
    listingLimit,
    listingsRemaining: Math.max(listingLimit - listings.length, 0),
  };

  return { listings, leads, clients, stats };
}
