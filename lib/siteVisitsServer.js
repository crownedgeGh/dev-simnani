import dbConnect from "@/lib/mongodb";
import SiteVisit from "@/models/SiteVisit";

// `leadId` is kept as an alias of the visit's own `id` for backward
// compatibility with FieldCPDashboard.jsx, which keys every visit card by
// `visit.leadId` (a naming artifact from when visits were purely client-side
// and only ever kept in memory).
export async function getSiteVisitsForFieldCp(accountId) {
  await dbConnect();
  const docs = await SiteVisit.find({ fieldCpAccountId: accountId }).sort({ createdAt: -1 }).lean();
  // JSON round-trip turns ObjectIds/Dates (incl. nested subdoc _ids) into plain strings
  return JSON.parse(JSON.stringify(docs)).map((doc) => ({
    ...doc,
    leadId: doc.id,
    followUps: (doc.followUps || []).map(({ note, at }) => ({ note, at })),
  }));
}
