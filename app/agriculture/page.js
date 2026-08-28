import CommercialCategories from "@/components/property/CommercialCategories";
import { getPropertiesByType, AGRICULTURE_CATEGORIES } from "@/lib/properties";

export const metadata = {
  title: "Agriculture / Farm Land | Simnani Estate",
  description:
    "Explore farm land by category — farm houses, agricultural land, orchards and plantations.",
};

export default async function AgriculturePage() {
  const agricultureProperties = getPropertiesByType("agriculture");

  const propertiesByCategory = AGRICULTURE_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = agricultureProperties.filter(
      (property) => property.category === category.key
    );
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="tracked-label text-xs text-gold-400">
          Agriculture / Farm Land
        </span>
        <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl">
          Explore by Category
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Browse farm houses, agricultural land, orchards and plantations
          across the country.
        </p>
      </div>

      <div className="mt-10">
        <CommercialCategories
          categories={AGRICULTURE_CATEGORIES}
          propertiesByCategory={propertiesByCategory}
          basePath="/agriculture"
        />
      </div>
    </div>
  );
}
