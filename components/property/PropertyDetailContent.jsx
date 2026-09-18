import { formatPostedDate, formatBhkLabel } from "@/lib/properties";
import { getPropertyDescription } from "@/lib/propertyContent";
import PropertyMediaCarousel from "@/components/property/PropertyMediaCarousel";
import BackButton from "@/components/layout/BackButton";
import {
  MdBed,
  MdBathtub,
  MdSquareFoot,
  MdCategory,
  MdTrendingUp,
  MdConfirmationNumber,
  MdSell,
  MdApartment,
  MdLocationCity,
  MdMap,
  MdPlace,
  MdHome,
  MdLayers,
  MdStairs,
  MdChair,
  MdLocalParking,
  MdExplore,
  MdEvent,
  MdGroup,
  MdAccessTime,
  MdPerson,
  MdWeekend,
} from "react-icons/md";

export default function PropertyDetailContent({ property, eyebrow, sidebar, backHref }) {
  const isInvest = property.type === "invest";

  const infoRows = [
    { icon: <MdConfirmationNumber />, label: "Property ID", value: property.id },
    { icon: <MdSell />, label: "Purpose", value: capitalize(property.purpose) },
    { icon: <MdApartment />, label: "Property Type", value: property.propertyType },
    { icon: <MdCategory />, label: "Category", value: capitalize(property.category) },
    { icon: <MdLocationCity />, label: "City", value: property.city },
    { icon: <MdMap />, label: "Locality", value: property.locality },
    { icon: <MdPlace />, label: "Landmark", value: property.landmark },
    { icon: <MdHome />, label: "Address", value: property.address },
    { icon: <MdLayers />, label: "Floor No.", value: property.floorNo },
    { icon: <MdStairs />, label: "Total Floors", value: property.totalFloors },
    { icon: <MdChair />, label: "Furnishing", value: property.furnishing },
    { icon: <MdLocalParking />, label: "Parking", value: capitalize(property.parking) },
    { icon: <MdExplore />, label: "Facing", value: property.facing },
    { icon: <MdEvent />, label: "Available From", value: property.availableFrom },
    { icon: <MdGroup />, label: "Preferred For", value: property.preferredFor },
    { icon: <MdAccessTime />, label: "Posted", value: formatPostedDate(property) || property.addedDate },
    { icon: <MdPerson />, label: "Contact Person", value: property.contact?.fullName },
  ].filter((row) => row.value !== undefined && row.value !== null && row.value !== "");

  const features = [
    property.parking?.toLowerCase() === "yes" && {
      icon: <MdLocalParking />,
      label: "Parking Available",
    },
    property.furnishing && property.furnishing !== "Unfurnished" && {
      icon: <MdWeekend />,
      label: property.furnishing,
    },
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PropertyMediaCarousel
        image={property.image}
        galleryImages={property.galleryImages}
        video={property.video}
        title={property.title}
        badge={property.badge}
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="tracked-label text-xs text-gold-400">
            {eyebrow || (isInvest ? "Investment Opportunity" : "Verified Property")}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <BackButton href={backHref} />
            <h1 className="font-display text-3xl text-cream sm:text-4xl">{property.title}</h1>
          </div>
          <p className="mt-2 text-sm text-muted">{property.location}</p>
          <p className="mt-4 font-sans text-2xl font-semibold text-gold-400">{property.price}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-y border-navy-700/60 py-6 sm:grid-cols-4">
            {isInvest ? (
              <Stat icon={<MdTrendingUp />} label="Est. Return" value={property.roi} />
            ) : (
              <>
                {property.beds > 0 && (
                  <Stat icon={<MdBed />} label="BHK" value={formatBhkLabel(property.beds, property.bedsPlus)} />
                )}
                {property.baths > 0 && <Stat icon={<MdBathtub />} label="Bathrooms" value={property.baths} />}
                <Stat icon={<MdSquareFoot />} label="Area" value={property.area} />
                <Stat icon={<MdCategory />} label="Type" value={property.type} />
              </>
            )}
          </div>

          <section className="mt-10">
            <h2 className="font-display text-xl text-cream">About This Property</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {getPropertyDescription(property)}
            </p>
          </section>

          {features.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-xl text-cream">Property Features</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {features.map(({ icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 border border-navy-700/60 bg-navy-900 p-3 transition hover:border-gold-500/50 sm:gap-3 sm:p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400/10 text-sm text-gold-400 sm:h-9 sm:w-9 sm:text-base">
                      {icon}
                    </span>
                    <span className="text-xs font-medium text-cream/90 sm:text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {infoRows.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-xl text-cream">Property Information</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {infoRows.map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-2 border border-navy-700/60 bg-navy-900 p-3 transition hover:border-gold-500/50 sm:gap-3 sm:p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400/10 text-sm text-gold-400 sm:h-9 sm:w-9 sm:text-base">
                      {icon}
                    </span>
                    <div className="min-w-0">
                      <p className="tracked-label text-[9px] text-muted sm:text-[10px]">{label}</p>
                      <p className="mt-0.5 break-words text-xs font-medium text-cream sm:text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">{sidebar}</div>
        </div>
      </div>
    </div>
  );
}

function capitalize(value) {
  if (!value || typeof value !== "string") return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function Stat({ icon, label, value }) {
  return (
    <div>
      <span className="mb-1.5 flex items-center gap-1.5 text-gold-400">
        <span className="text-lg">{icon}</span>
      </span>
      <p className="font-display text-lg text-cream">{value}</p>
      <p className="tracked-label mt-1 text-[10px] text-muted">{label}</p>
    </div>
  );
}
