import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Property from "@/models/Property";

function sanitizeDoc(doc) {
  if (!doc) return null;
  const obj = { ...doc };
  if (obj._id) obj._id = obj._id.toString();
  delete obj.password;
  return obj;
}

async function attachPropertiesListed(brokers) {
  return Promise.all(
    brokers.map(async (broker) => {
      const propertiesListed = await Property.countDocuments({
        ownerId: broker.accountId,
        status: { $nin: ["Rejected", "Closed"] },
      });
      return { ...broker, propertiesListed };
    })
  );
}

// Brokers shown on the homepage.
// Priority:
//   1. Admin-featured premium brokers ordered by featuredPosition (1–10)
//   2. Fallback: all active premium brokers (up to 8)
//   3. Fallback: any active brokers (up to 8) — so the section is never empty
export async function getFeaturedBrokers() {
  try {
    await dbConnect();

    // Tier 1 — admin-curated featured list
    let docs = await User.find({
      accountType: "broker",
      status: "Active",
      plan: "premium",
      isFeaturedBroker: true,
      featuredPosition: { $ne: null },
    })
      .sort({ featuredPosition: 1 })
      .limit(10)
      .lean();

    // Tier 2 — any premium broker
    if (!docs.length) {
      docs = await User.find({
        accountType: "broker",
        status: "Active",
        plan: "premium",
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
    }

    // Tier 3 — any active broker
    if (!docs.length) {
      docs = await User.find({
        accountType: "broker",
        status: "Active",
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean();
    }

    return attachPropertiesListed(docs.map(sanitizeDoc));
  } catch (error) {
    console.error("Error fetching featured brokers:", error);
    return [];
  }
}


// A single active broker, used by the public agent profile page.
export async function getBrokerByAccountId(accountId) {
  try {
    await dbConnect();
    const doc = await User.findOne({
      accountId,
      accountType: "broker",
      status: "Active",
    }).lean();
    if (!doc) return null;
    const [broker] = await attachPropertiesListed([sanitizeDoc(doc)]);
    return broker;
  } catch (error) {
    console.error(`Error fetching broker "${accountId}":`, error);
    return null;
  }
}

// All premium-plan brokers, used by the admin "Featured Brokers" page to
// pick who gets shown on the homepage and in what position.
export async function getPremiumBrokers() {
  try {
    await dbConnect();
    const docs = await User.find({
      accountType: "broker",
      plan: "premium",
    })
      .sort({ featuredPosition: 1, createdAt: -1 })
      .lean();

    return attachPropertiesListed(docs.map(sanitizeDoc));
  } catch (error) {
    console.error("Error fetching premium brokers:", error);
    return [];
  }
}
