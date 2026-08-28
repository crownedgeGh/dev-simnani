import CommercialCategories from "@/components/property/CommercialCategories";
import { getPropertiesByType, COMMERCIAL_CATEGORIES } from "@/lib/properties";

export const metadata = {
  title: "Commercial Properties | Simnani Estate",
  description:
    "Browse commercial investment opportunities by property type — offices, retail, land, warehousing, cold storage and hospitality.",
};

export default async function CommercialPage() {
  const commercialProperties = getPropertiesByType("commercial");

  const propertiesByCategory = COMMERCIAL_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = commercialProperties.filter(
      (property) => property.category === category.key
    );
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="tracked-label text-xs text-gold-400">Commercial</span>
        <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl">
          Explore by Commercial Category
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Browse commercial investment opportunities by property type — from
          offices and retail to warehousing, cold storage, and hospitality.
        </p>
      </div>

      <div className="mt-10">
        <CommercialCategories
          categories={COMMERCIAL_CATEGORIES}
          propertiesByCategory={propertiesByCategory}
        />
      </div>
    </div>
  );
}
