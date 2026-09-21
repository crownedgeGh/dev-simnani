import {
  formatPostedDate,
  CATEGORIES_BY_TYPE,
  isStructureCategory,
  categoryHasBedrooms,
  getGenderPreferenceLabel,
  getBathroomTypeLabel,
  isPgOrHostel,
} from "@/lib/properties";
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
  MdWc,
} from "react-icons/md";

export default function PropertyDetailContent({ property, eyebrow, sidebar, backHref }) {
  const isInvest = property.type === "invest";
  // A category-aware view of which fields make sense for this listing —
  // e.g. Plantation Farming / Agricultural Land are bare land with no
  // structure, so floor/furnishing/parking/bathrooms don't apply, and only
  // Farmhouse/Apartments-style categories have bedrooms & halls.
  const isStructural = isStructureCategory(property.type, property.category);
  const hasBedrooms = categoryHasBedrooms(property.type, property.category, property.propertyType);
  const isResidentialListing = !CATEGORIES_BY_TYPE[property.type];

  const infoRows = [
    { icon: <MdConfirmationNumber />, label: "Property ID", value: property.id },
    { icon: <MdSell />, label: "Purpose", value: capitalize(property.purpose) },
    { icon: <MdApartment />, label: "Property Type", value: property.propertyType },
    { icon: <MdCategory />, label: "Category", value: capitalize(property.category) },
    { icon: <MdLocationCity />, label: "City", value: property.city },
    { icon: <MdMap />, label: "Locality", value: property.locality },
    { icon: <MdPlace />, label: "Landmark", value: property.landmark },
    { icon: <MdHome />, label: "Address", value: property.address },
    hasBedrooms && {
      icon: <MdBed />,
      label: "No. of Bedrooms",
      value: property.beds > 0 ? property.beds : "",
    },
    hasBedrooms && {
      icon: <MdWeekend />,
      label: "No. of Halls",
      value: property.halls > 0 ? property.halls : "",
    },
    property.bathroomType && {
      icon: <MdBathtub />,
      label: "Bathroom",
      value: getBathroomTypeLabel(property.bathroomType),
    },
    isStructural && !isPgOrHostel(property.propertyType) && {
      icon: <MdBathtub />,
      label: "No. of Bathrooms",
      value: property.baths > 0 ? property.baths : "",
    },
    isStructural && { icon: <MdLayers />, label: "Floor No.", value: property.floorNo },
    isStructural && { icon: <MdStairs />, label: "Total Floors", value: property.totalFloors },
    isStructural && { icon: <MdChair />, label: "Furnishing", value: property.furnishing },
    isStructural && { icon: <MdLocalParking />, label: "Parking", value: capitalize(property.parking) },
    { icon: <MdExplore />, label: "Facing", value: property.facing },
    { icon: <MdEvent />, label: "Available From", value: property.availableFrom },
    isResidentialListing && { icon: <MdGroup />, label: "Preferred For", value: property.preferredFor },
    isResidentialListing &&
      property.genderPreference && {
        icon: <MdWc />,
        label: "Suitable For",
        value: getGenderPreferenceLabel(property.genderPreference),
      },
    { icon: <MdAccessTime />, label: "Posted", value: formatPostedDate(property) || property.addedDate },
    { icon: <MdPerson />, label: "Contact Person", value: property.contact?.fullName },
  ]
    .filter(Boolean)
    .filter((row) => row.value !== undefined && row.value !== null && row.value !== "");

  const features = [
    isStructural &&
      property.parking?.toLowerCase() === "yes" && {
        icon: <MdLocalParking />,
        label: "Parking Available",
      },
    isStructural &&
      property.furnishing &&
      property.furnishing !== "Unfurnished" && {
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
                {hasBedrooms && property.beds > 0 && (
                  <Stat icon={<MdBed />} label="No. of Bedrooms" value={property.beds} />
                )}
                {hasBedrooms && property.halls > 0 && (
                  <Stat icon={<MdWeekend />} label="Halls" value={property.halls} />
                )}
                {property.bathroomType ? (
                  <Stat icon={<MdBathtub />} label="Bathroom" value={getBathroomTypeLabel(property.bathroomType)} />
                ) : isStructural && property.baths > 0 ? (
                  <Stat icon={<MdBathtub />} label="Bathrooms" value={property.baths} />
                ) : null}
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
