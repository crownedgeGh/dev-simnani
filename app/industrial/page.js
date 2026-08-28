import CommercialCategories from "@/components/property/CommercialCategories";
import { getPropertiesByType, INDUSTRIAL_CATEGORIES } from "@/lib/properties";

export const metadata = {
  title: "Industrial Property | Simnani Estate",
  description:
    "Explore warehouses, sheds and industrial spaces for sale and lease.",
};

export default async function IndustrialPage() {
  const industrialProperties = getPropertiesByType("industrial");

  const propertiesByCategory = INDUSTRIAL_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = industrialProperties.filter(
      (property) => property.category === category.key
    );
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="tracked-label text-xs text-gold-400">Industrial</span>
        <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl">
          Explore by Industrial Category
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Browse warehouses, sheds and industrial spaces by category — for
          sale and lease.
        </p>
      </div>

      <div className="mt-10">
        <CommercialCategories
          categories={INDUSTRIAL_CATEGORIES}
          propertiesByCategory={propertiesByCategory}
          basePath="/industrial"
        />
      </div>
    </div>
  );
}
