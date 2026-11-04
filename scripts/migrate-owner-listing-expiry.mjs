// One-off migration: give existing owner/builder listings an expiresAt of
// createdAt + 6 months (matches OWNER_VISIBILITY_MONTHS in lib/properties.js).
// Listings older than 6 months become Expired right away — owners can Renew.
//
// Run with: node --env-file=.env.local scripts/migrate-owner-listing-expiry.mjs [--dry-run]
import mongoose from "mongoose";

const DRY_RUN = process.argv.includes("--dry-run");

await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
const props = mongoose.connection.db.collection("properties");
const filter = { postedByAccountType: { $in: ["owner", "builder"] }, expiresAt: { $in: [null] } };

const n = await props.countDocuments(filter);
console.log(`${DRY_RUN ? "[dry-run] would set" : "setting"} expiresAt on ${n} listings`);
if (!DRY_RUN && n) {
  await props.updateMany(filter, [{ $set: { expiresAt: { $dateAdd: { startDate: "$createdAt", unit: "month", amount: 6 } } } }]);
}
await mongoose.disconnect();
