import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Lead from "@/models/Lead";
import Client from "@/models/Client";

export async function getOwnerPortalData(ownerId) {
  await dbConnect();

  const docs = await Property.find({ ownerId }).sort({ createdAt: -1 }).lean();
  const listings = docs.map((doc) => ({ ...doc, _id: doc._id.toString() }));

  const leadDocs = await Lead.find({ ownerId }).sort({ createdAt: -1 }).lean();
  const leads = leadDocs.map((doc) => ({ ...doc, _id: doc._id.toString() }));

  const clientDocs = await Client.find({ ownerId }).sort({ createdAt: -1 }).lean();
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

  return { listings, leads, clients, stats };
}
