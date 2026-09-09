import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { PROPERTIES } from "@/lib/properties";

/**
 * Server-side data fetching functions that connect directly to MongoDB
 * with seamless fallback to static PROPERTIES array if DB is unreachable.
 */

function sanitizeDoc(doc) {
  if (!doc) return null;
  const obj = { ...doc };
  if (obj._id) obj._id = obj._id.toString();
  return obj;
}

export async function getPropertiesByType(type) {
  try {
    await dbConnect();
    const typeCondition = type === "buy" ? { $in: ["buy", "sell"] } : type;
    const query = {
      type: typeCondition,
      status: { $ne: "Rejected" },
    };
    const docs = await Property.find(query).sort({ createdAt: -1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(sanitizeDoc);
    }
  } catch (error) {
    console.error(`Error fetching properties for type "${type}":`, error);
  }
  return PROPERTIES.filter((p) => p.type === type);
}

export async function getFeaturedProperties() {
  try {
    await dbConnect();
    const query = {
      featured: true,
      status: { $ne: "Rejected" },
    };
    const docs = await Property.find(query).sort({ createdAt: -1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(sanitizeDoc);
    }
  } catch (error) {
    console.error("Error fetching featured properties:", error);
  }
  return PROPERTIES.filter((p) => p.featured);
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

export async function getAllProperties(filter = {}) {
  try {
    await dbConnect();
    const query = {
      status: { $ne: "Rejected" },
      ...filter,
    };
    const docs = await Property.find(query).sort({ createdAt: -1 }).lean();
    if (docs && docs.length > 0) {
      return docs.map(sanitizeDoc);
    }
  } catch (error) {
    console.error("Error fetching all properties:", error);
  }
  return PROPERTIES;
}
