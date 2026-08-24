export const AMENITIES = [
  "24/7 Security",
  "Private Lift",
  "Smart Home Automation",
  "Landscaped Gardens",
  "Clubhouse & Spa",
  "Power Backup",
  "Covered Parking",
  "High-Speed Elevators",
];

export const NEARBY_PLACES = [
  { label: "International School", distance: "0.8 mi" },
  { label: "Multi-Specialty Hospital", distance: "1.2 mi" },
  { label: "Luxury Shopping Mall", distance: "0.5 mi" },
  { label: "Metro Station", distance: "0.4 mi" },
];

export function getPropertyDescription(property) {
  const bedsPhrase = property.beds ? `${property.beds} spacious bedrooms and ` : "";
  const badgePhrase = property.badge ? `${property.badge.toLowerCase()} ` : "";

  return `${property.title} is a ${badgePhrase}residence in ${property.location}, offering ${bedsPhrase}refined architectural detailing throughout. Designed for discerning buyers, every element reflects Simnani Estate's commitment to uncompromising quality and enduring craftsmanship.`;
}

export function getProjectDescription(project) {
  return `${project.name} is a landmark development by ${project.developer} in ${project.location}, currently ${project.status.toLowerCase()}. The project brings together thoughtful masterplanning and premium specifications, curated for buyers and investors seeking long-term value.`;
}
