import Property from "@/models/Property";
import { getListingExpiry, getListingLimit, listingCountFilter } from "@/lib/properties";

// True when an owner/builder has no free active slot left. Always false for
// other account types (their quota is enforced only at creation).
export async function ownerSlotsFull(user) {
  if (!getListingExpiry(user.accountType)) return false;
  const limit = getListingLimit(user.accountType, user.topupCredits);
  const used = await Property.countDocuments(listingCountFilter(user.accountId, user.accountType));
  return used >= limit;
}

// Race guard for concurrent submits: the count-then-create check in the POST
// handler is not atomic, so after inserting, re-rank the user's counted
// listings (oldest _id first). A listing ranked beyond the limit lost the race
// and is rolled back. Returns true if the new listing keeps its slot.
export async function keepsSlot(user, propertyDoc) {
  const limit = getListingLimit(user.accountType, user.topupCredits);
  const ids = await Property.find(listingCountFilter(user.accountId, user.accountType), { _id: 1 })
    .sort({ _id: 1 })
    .limit(limit)
    .lean();
  if (ids.some((d) => String(d._id) === String(propertyDoc._id))) return true;
  await Property.deleteOne({ _id: propertyDoc._id });
  return false;
}

// Same idea for renew/reopen, which flip an existing doc live: if the flip
// pushed the user over the limit, undo it via `revert`. Both racers may revert
// (never over-allocates); the user just retries.
export async function overLimit(user) {
  const limit = getListingLimit(user.accountType, user.topupCredits);
  return (await Property.countDocuments(listingCountFilter(user.accountId, user.accountType))) > limit;
}
