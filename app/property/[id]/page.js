import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/propertiesServer";
import { formatPostedDate } from "@/lib/properties";
import { AMENITIES, NEARBY_PLACES, getPropertyDescription } from "@/lib/propertyContent";
import PropertyActionCard from "@/components/property/PropertyActionCard";
import PropertyMediaCarousel from "@/components/property/PropertyMediaCarousel";
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
  MdPhone,
  MdSecurity,
  MdElevator,
  MdSmartToy,
  MdYard,
  MdSpa,
  MdPower,
  MdCheckCircle,
} from "react-icons/md";

const AMENITY_ICONS = {
  "24/7 Security": MdSecurity,
  "Private Lift": MdElevator,
  "Smart Home Automation": MdSmartToy,
  "Landscaped Gardens": MdYard,
  "Clubhouse & Spa": MdSpa,
  "Power Backup": MdPower,
  "Covered Parking": MdLocalParking,
  "High-Speed Elevators": MdElevator,
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) return {};

  return {
    title: `${property.title} | Simnani Estate`,
    description: `${property.title} in ${property.location} — ${property.price}.`,
  };
}

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

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
    { icon: <MdPhone />, label: "Contact Number", value: property.contact?.mobile },
  ].filter((row) => row.value !== undefined && row.value !== null && row.value !== "");

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
            {isInvest ? "Investment Opportunity" : "Verified Property"}
          </p>
          <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl">{property.title}</h1>
          <p className="mt-2 text-sm text-muted">{property.location}</p>
          <p className="mt-4 font-display text-2xl text-gold-400">{property.price}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-y border-navy-700/60 py-6 sm:grid-cols-4">
            {isInvest ? (
              <Stat icon={<MdTrendingUp />} label="Est. Return" value={property.roi} />
            ) : (
              <>
                {property.beds && <Stat icon={<MdBed />} label="Bedrooms" value={property.beds} />}
                {property.baths && <Stat icon={<MdBathtub />} label="Bathrooms" value={property.baths} />}
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

          <section className="mt-10">
            <h2 className="font-display text-xl text-cream">Property Features</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {AMENITIES.map((amenity) => {
                const AmenityIcon = AMENITY_ICONS[amenity] || MdCheckCircle;
                return (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 border border-navy-700/60 bg-navy-900 p-3 transition hover:border-gold-500/50 sm:gap-3 sm:p-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400/10 text-sm text-gold-400 sm:h-9 sm:w-9 sm:text-base">
                      <AmenityIcon />
                    </span>
                    <span className="text-xs font-medium text-cream/90 sm:text-sm">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </section>

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

          <section className="mt-10">
            <h2 className="font-display text-xl text-cream">Location & Surroundings</h2>
            <p className="mt-2 text-sm text-muted">{property.location}</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {NEARBY_PLACES.map((place) => (
                <div
                  key={place.label}
                  className="flex items-center justify-between border border-navy-700/60 bg-navy-900 px-4 py-3 text-sm"
                >
                  <span className="text-cream/80">{place.label}</span>
                  <span className="text-muted">{place.distance}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <PropertyActionCard
              propertyId={property.id}
              contactName={property.contact?.fullName}
              contactMobile={property.contact?.mobile}
            />
          </div>
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
