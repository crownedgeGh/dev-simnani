import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Assignment from "@/models/Assignment";

// Registered Channel Partner directory — used to seed portal pages with the
// real accounts (name + city + state) available to forward/delegate to,
// instead of the empty demo CP_NETWORK fixture.
export async function getCpNetwork(cpType) {
  await dbConnect();

  const query = {
    accountType: "freelancer",
    status: "Active",
    cpApprovalStatus: "active",
  };
  if (cpType) query.cpType = cpType;

  const users = await User.find(query)
    .select("accountId fullName mobile city state cpType")
    .sort({ fullName: 1 })
    .lean();

  return users.map((u) => ({
    id: u.accountId,
    accountId: u.accountId,
    name: u.fullName,
    mobile: u.mobile,
    city: u.city || "",
    state: u.state || "",
    cpType: u.cpType,
  }));
}

export async function getAssignmentsForAccount(accountId) {
  await dbConnect();
  const docs = await Assignment.find({ assignedToAccountId: accountId }).sort({ createdAt: -1 }).lean();
  return docs.map((d) => ({ ...d, _id: d._id.toString() }));
}

export async function getAllAssignments() {
  await dbConnect();
  const docs = await Assignment.find({}).sort({ createdAt: -1 }).lean();
  return docs.map((d) => ({ ...d, _id: d._id.toString() }));
}
