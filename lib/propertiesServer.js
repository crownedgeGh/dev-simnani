import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { PROPERTIES } from "@/lib/properties";

/**
 * Server-side data fetching functions that connect directly to MongoDB,
 * merged with the static PROPERTIES demo data (used standalone if the DB
 * is unreachable, or blended in alongside live DB docs otherwise).
 */

function sanitizeDoc(doc) {
  if (!doc) return null;
  const obj = { ...doc };
  if (obj._id) obj._id = obj._id.toString();
  return obj;
}

function mergeWithStatic(docs, staticMatches) {
  const dbIds = new Set(docs.map((d) => d.id));
  return [...docs, ...staticMatches.filter((p) => !dbIds.has(p.id))];
}

export async function getPropertiesByType(type) {
  const staticMatches = PROPERTIES.filter((p) => p.type === type);
  try {
    await dbConnect();
    const typeCondition = type === "buy" ? { $in: ["buy", "sell"] } : type;
    const query = {
      type: typeCondition,
      status: { $nin: ["Rejected", "Closed"] },
    };
    const docs = await Property.find(query).sort({ createdAt: -1 }).lean();
    if (docs) {
      return mergeWithStatic(docs.map(sanitizeDoc), staticMatches);
    }
  } catch (error) {
    console.error(`Error fetching properties for type "${type}":`, error);
  }
  return staticMatches;
}

export async function getPropertiesByTypeAndCategory(type, category) {
  const staticMatches = PROPERTIES.filter((p) => p.type === type && p.category === category);
  try {
    await dbConnect();
    const query = {
      type,
      category,
      status: { $nin: ["Rejected", "Closed"] },
    };
    const docs = await Property.find(query).sort({ createdAt: -1 }).lean();
    if (docs) {
      return mergeWithStatic(docs.map(sanitizeDoc), staticMatches);
    }
  } catch (error) {
    console.error(`Error fetching properties for type "${type}" category "${category}":`, error);
  }
  return staticMatches;
}

export async function getFeaturedProperties() {
  const staticMatches = PROPERTIES.filter((p) => p.featured);
  try {
    await dbConnect();
    const query = {
      featured: true,
      status: { $nin: ["Rejected", "Closed"] },
    };
    const docs = await Property.find(query).sort({ createdAt: -1 }).lean();
    if (docs) {
      return mergeWithStatic(docs.map(sanitizeDoc), staticMatches);
    }
  } catch (error) {
    console.error("Error fetching featured properties:", error);
  }
  return staticMatches;
}

export async function getPropertyById(id) {
  try {
    await dbConnect();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const doc = await Property.findOne({
      $or: [{ id }, { _id: isObjectId ? id : null }],
    }).lean();
    if (doc) {
      return sanitizeDoc(doc);
    }
  } catch (error) {
    console.error(`Error fetching property by id "${id}":`, error);
  }
  return PROPERTIES.find((p) => p.id === id) || null;
}

export async function getPropertiesByOwnerId(ownerId) {
  try {
    await dbConnect();
    const docs = await Property.find({
      ownerId,
      status: { $nin: ["Rejected", "Closed"] },
    })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(sanitizeDoc);
  } catch (error) {
    console.error(`Error fetching properties for owner "${ownerId}":`, error);
    return [];
  }
}

export async function getAllProperties(filter = {}) {
  try {
    await dbConnect();
    const query = {
      status: { $nin: ["Rejected", "Closed"] },
      ...filter,
    };
    const docs = await Property.find(query).sort({ createdAt: -1 }).lean();
    if (docs) {
      return mergeWithStatic(docs.map(sanitizeDoc), PROPERTIES);
    }
  } catch (error) {
    console.error("Error fetching all properties:", error);
  }
  return PROPERTIES;
}
