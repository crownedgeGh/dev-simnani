import Image from "next/image";
import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/properties";
import { AMENITIES, NEARBY_PLACES, getPropertyDescription } from "@/lib/propertyContent";
import PropertyActionCard from "@/components/property/PropertyActionCard";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = getPropertyById(id);
  if (!property) return {};

  return {
    title: `${property.title} | Simnani Estate`,
    description: `${property.title} in ${property.location} — ${property.price}.`,
  };
}

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) {
    notFound();
  }

  const isInvest = property.type === "invest";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative aspect-[16/9] w-full overflow-hidden border border-navy-700/60">
        <Image
          src={property.image}
          alt={property.title}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        {property.badge && (
          <span className="tracked-label absolute left-4 top-4 bg-gold-500 px-3 py-1.5 text-[10px] font-semibold text-navy-950">
            {property.badge}
          </span>
        )}
      </div>

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
              <Stat label="Est. Return" value={property.roi} />
            ) : (
              <>
                {property.beds && <Stat label="Bedrooms" value={property.beds} />}
                {property.baths && <Stat label="Bathrooms" value={property.baths} />}
                <Stat label="Area" value={property.area} />
                <Stat label="Type" value={property.type} />
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
            <div className="mt-4 flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => (
                <span
                  key={amenity}
                  className="tracked-label border border-navy-700/60 px-3 py-2 text-xs text-cream/80"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </section>

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
            <PropertyActionCard propertyId={property.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="font-display text-lg text-cream">{value}</p>
      <p className="tracked-label mt-1 text-[10px] text-muted">{label}</p>
    </div>
  );
}
