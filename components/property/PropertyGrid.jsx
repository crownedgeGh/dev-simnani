import PropertyCard from "./PropertyCard";

export default function PropertyGrid({ properties, emptyMessage }) {
  if (!properties || properties.length === 0) {
    return (
      <div className="rounded-sm border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
        <p className="text-muted">
          {emptyMessage || "No properties match this selection right now."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
