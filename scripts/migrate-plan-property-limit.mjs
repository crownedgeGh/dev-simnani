// One-off migration: align users.planPropertyLimit with the free-tier caps in
// lib/properties.js (owner/builder 5, broker/freelancer 20, others 0).
// Only touches free-plan users; paid plans keep their subscription limit.
//
// Run with: node --env-file=.env.local scripts/migrate-plan-property-limit.mjs [--dry-run]
import mongoose from "mongoose";

const DRY_RUN = process.argv.includes("--dry-run");
const LIMITS = [
  [["owner", "builder"], 5],
  [["broker", "freelancer"], 20],
];
const POSTING = LIMITS.flatMap(([types]) => types);

await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
const users = mongoose.connection.db.collection("users");
const free = { $or: [{ plan: "free" }, { plan: { $exists: false } }] };

const ops = [
  ...LIMITS.map(([types, limit]) => ({ filter: { ...free, accountType: { $in: types }, planPropertyLimit: { $ne: limit } }, limit })),
  { filter: { ...free, accountType: { $nin: POSTING }, planPropertyLimit: { $ne: 0 } }, limit: 0 },
];

for (const { filter, limit } of ops) {
  const n = await users.countDocuments(filter);
  console.log(`${DRY_RUN ? "[dry-run] would set" : "setting"} planPropertyLimit=${limit} on ${n} users`);
  if (!DRY_RUN && n) await users.updateMany(filter, { $set: { planPropertyLimit: limit } });
}
await mongoose.disconnect();
