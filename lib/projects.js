// listingType mirrors the Buy / Rent / Lease purpose tabs used across the
// rest of the site (see PurposeTabs) so projects can share that UI.
const LISTING_TYPE_TO_PURPOSE = { buy: "Sale", rent: "Rent", lease: "Lease" };

export const PROJECTS = [
  {
    id: "green-residences",
    name: "Simnani Green Residences",
    location: "Whitefield, Bangalore",
    startingPrice: "₹78 Lakh onwards",
    developer: "Simnani Developers",
    status: "Under Construction",
    listingType: "buy",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "meadow-plots",
    name: "Simnani Meadow Plots",
    location: "Shadnagar, Hyderabad",
    startingPrice: "₹22 Lakh onwards",
    developer: "Meadow Realty",
    status: "Ready to Register",
    listingType: "lease",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "business-park",
    name: "Simnani Business Park",
    location: "BKC, Mumbai",
    startingPrice: "₹1.4 Cr onwards",
    developer: "Simnani Commercial",
    status: "Under Construction",
    listingType: "rent",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "orchard-farms",
    name: "Simnani Orchard Farms",
    location: "Mulshi, Pune",
    startingPrice: "₹35 Lakh onwards",
    developer: "Orchard Land Co.",
    status: "Ready to Move",
    listingType: "buy",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "palm-villas",
    name: "Simnani Palm Villas",
    location: "ECR, Chennai",
    startingPrice: "₹2.1 Cr onwards",
    developer: "Palm Estates",
    status: "Possession 2027",
    listingType: "buy",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop",
  },
];

export function getProjectById(id) {
  return PROJECTS.find((project) => project.id === id);
}

// Adapts PROJECTS into the property shape PropertyCard/PropertyFilterBar
// expect, so the company-projects page can reuse the same list UI as the
// rest of the site (PurposeTabs, PropertyFilterBar, PropertyCard).
export function getProjectsAsProperties() {
  return PROJECTS.map((project) => ({
    id: project.id,
    title: project.name,
    price: project.startingPrice,
    location: project.location,
    developer: project.developer,
    status: project.status,
    image: project.image,
    purpose: LISTING_TYPE_TO_PURPOSE[project.listingType] || "Sale",
    propertyType: "Premium Project",
    category: "commercial",
    type: "buy",
    badge: project.status,
    address: `${project.name}, ${project.location}`,
    contact: { fullName: "Simnani CP Partner Desk", mobile: "+91 98765 43210" },
  }));
}
