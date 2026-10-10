export function getMapHref({ mapLocation, address, location } = {}) {
  if (mapLocation) return mapLocation;
  const query = address || location;
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
