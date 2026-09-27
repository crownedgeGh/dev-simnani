import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Assignment from "@/models/Assignment";
import { PROPERTIES } from "@/lib/properties";
import { PROJECTS } from "@/lib/projects";

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

function convertProjectToProperty(project) {
  if (!project) return null;
  return {
    id: project.id,
    title: project.name,
    price: project.startingPrice,
    location: project.location,
    developer: project.developer,
    status: project.status,
    image: project.image,
    galleryImages: [project.image],
    purpose: "Sale",
    propertyType: "Premium Project",
    category: "commercial",
    type: "buy",
    city: project.location?.split(",")?.[1]?.trim() || project.location,
    locality: project.location?.split(",")?.[0]?.trim() || project.location,
    landmark: project.location,
    address: `${project.name}, ${project.location}`,
    description: `${project.name} by ${project.developer} is a landmark development in ${project.location}, currently ${project.status.toLowerCase()}. Designed for modern commercial and residential excellence, offering world-class infrastructure and prime connectivity. Units starting at ${project.startingPrice}.`,
    badge: project.status,
    contact: {
      fullName: "Simnani CP Partner Desk",
      mobile: "+91 98765 43210",
    },
  };
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

    // Check if id is an assignment ID
    if (id?.startsWith("SG-ASG-") || id?.includes("ASG")) {
      const assignment = await Assignment.findOne({ id }).lean();
      if (assignment) {
        if (assignment.propertyId) {
          const linkedDoc = await Property.findOne({
            $or: [
              { id: assignment.propertyId },
              { _id: /^[0-9a-fA-F]{24}$/.test(assignment.propertyId) ? assignment.propertyId : null },
            ],
          }).lean();
          if (linkedDoc) return sanitizeDoc(linkedDoc);

          const staticMatch = PROPERTIES.find((p) => p.id === assignment.propertyId);
          if (staticMatch) return staticMatch;

          const projMatch = PROJECTS.find((p) => p.id === assignment.propertyId);
          if (projMatch) return convertProjectToProperty(projMatch);
        }

        return {
          id: assignment.id,
          title: assignment.propertyTitle || "Assigned Property",
          price: "Price on Request",
          location: assignment.propertyLocation || "Prime Location",
          image: assignment.propertyImage || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80&auto=format&fit=crop",
          galleryImages: assignment.propertyImage ? [assignment.propertyImage] : [],
          purpose: "Sale",
          propertyType: "Assigned Property",
          category: "commercial",
          type: "buy",
          city: assignment.assignedToCity || assignment.propertyLocation || "",
          locality: assignment.propertyLocation || "",
          address: `${assignment.propertyTitle || "Property"}, ${assignment.propertyLocation || ""}`,
          description: `Assigned property: ${assignment.propertyTitle}. Forwarded to ${assignment.assignedToName} (${assignment.assignedToCpType} CP).`,
          badge: assignment.status,
          contact: {
            fullName: assignment.assignedByName || "Head CP Desk",
            mobile: "+91 98765 43210",
          },
        };
      }
    }
  } catch (error) {
    console.error(`Error fetching property by id "${id}":`, error);
  }

  const staticProp = PROPERTIES.find((p) => p.id === id);
  if (staticProp) return staticProp;

  const project = PROJECTS.find((p) => p.id === id);
  if (project) return convertProjectToProperty(project);

  return null;
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
