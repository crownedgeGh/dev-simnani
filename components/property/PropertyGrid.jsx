import { BiBuildingHouse } from "react-icons/bi";
import PropertyCard from "./PropertyCard";

export default function PropertyGrid({
  properties,
  emptyMessage,
  emptyTitle,
  hideContactButton,
  emphasizeDetails,
  ownerView,
}) {
  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-sm border border-navy-700/60 bg-navy-900 px-6 py-16 text-center sm:py-24">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/40 bg-gold-400/10">
          <BiBuildingHouse className="h-7 w-7 text-gold-400" />
        </div>
        <span className="tracked-label text-xs text-gold-400">Coming Soon</span>
        <h3 className="font-display text-xl text-cream sm:text-2xl">
          {emptyTitle || "New listings on the way"}
        </h3>
        <p className="max-w-md text-sm text-muted">
          {emptyMessage || "No properties match this selection right now."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          hideContactButton={hideContactButton}
          emphasizeDetails={emphasizeDetails}
          ownerView={ownerView}
        />
      ))}
    </div>
  );
}
