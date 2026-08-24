import PropertyGrid from "@/components/property/PropertyGrid";
import { getFeaturedProperties } from "@/lib/properties";

export default function FeaturedProperties() {
  const properties = getFeaturedProperties();

  return (
    <section className="bg-navy-900/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-2xl text-cream sm:text-3xl">
            Featured Properties
          </h2>
          <p className="mt-3 text-sm text-muted">
            Explore handpicked properties from trusted sellers and
            developers.
          </p>
        </div>

        <div className="mt-12">
          <PropertyGrid properties={properties} />
        </div>
      </div>
    </section>
  );
}
