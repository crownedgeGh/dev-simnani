// One-off migration: Residential listings now only cover Flat, House, Plot,
// PG and Hostel (see lib/properties.js RESIDENTIAL_PROPERTY_TYPES). Any
// existing Mongo document that was saved under a Residential "type"
// (buy/sell/rent/lease) with propertyType Shop/Office/Warehouse is moved to
// the Commercial section, mapped onto the matching COMMERCIAL_CATEGORIES key.
//
// Run with: node --env-file=.env.local scripts/migrate-residential-commercial.mjs
// Add --dry-run to only print what would change without writing anything.
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Run with: node --env-file=.env.local scripts/migrate-residential-commercial.mjs");
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");

const RESIDENTIAL_TYPES = ["buy", "sell", "rent", "lease"];

// Mirrors COMMERCIAL_CATEGORIES in lib/properties.js
const PROPERTY_TYPE_TO_COMMERCIAL_CATEGORY = {
  shop: { key: "shops-retail", label: "Shops & Retail" },
  office: { key: "ready-to-move-offices", label: "Ready to Move Offices" },
  warehouse: { key: "warehouse", label: "Warehouse" },
};

async function main() {
  await mongoose.connect(MONGODB_URI, { family: 4 });
  const db = mongoose.connection.db;
  const collection = db.collection("properties");

  const candidates = await collection
    .find({
      type: { $in: RESIDENTIAL_TYPES },
      propertyType: { $exists: true, $ne: null },
    })
    .toArray();

  const toMigrate = candidates.filter((doc) => {
    const key = String(doc.propertyType || "").trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(PROPERTY_TYPE_TO_COMMERCIAL_CATEGORY, key);
  });

  console.log(`Found ${toMigrate.length} residential listing(s) to move to Commercial.`);

  for (const doc of toMigrate) {
    const key = String(doc.propertyType).trim().toLowerCase();
    const target = PROPERTY_TYPE_TO_COMMERCIAL_CATEGORY[key];
    console.log(
      `${DRY_RUN ? "[dry-run] " : ""}${doc.id || doc._id}: type "${doc.type}" propertyType "${doc.propertyType}" -> type "commercial" category "${target.key}" propertyType "${target.label}"`
    );
    if (!DRY_RUN) {
      await collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            type: "commercial",
            category: target.key,
            propertyType: target.label,
          },
        }
      );
    }
  }

  console.log(DRY_RUN ? "Dry run complete — no documents were changed." : "Migration complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
