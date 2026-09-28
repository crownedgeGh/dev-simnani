import dbConnect from "@/lib/mongodb";
import SiteVisit from "@/models/SiteVisit";

// `leadId` is kept as an alias of the visit's own `id` for backward
// compatibility with FieldCPDashboard.jsx, which keys every visit card by
// `visit.leadId` (a naming artifact from when visits were purely client-side
// and only ever kept in memory).
export async function getSiteVisitsForFieldCp(accountId) {
  await dbConnect();
  const docs = await SiteVisit.find({ fieldCpAccountId: accountId }).sort({ createdAt: -1 }).lean();
  return docs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
    leadId: doc.id,
  }));
}
