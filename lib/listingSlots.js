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
