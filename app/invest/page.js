import CommercialCategories from "@/components/property/CommercialCategories";
import { getPropertiesByType, INVEST_CATEGORIES } from "@/lib/properties";

export const metadata = {
  title: "Invest in Real Estate | Simnani Estate",
  description:
    "Explore property investment opportunities by category — shops, land, farmhouses, offices and apartments.",
};

export default async function InvestPage() {
  const investProperties = getPropertiesByType("invest");

  const propertiesByCategory = INVEST_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = investProperties.filter(
      (property) => property.category === category.key
    );
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="tracked-label text-xs text-gold-400">Invest</span>
        <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl">
          Explore by Investment Category
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Browse long-term investment opportunities by property type — shops,
          land, farmhouses, offices and apartments.
        </p>
      </div>

      <div className="mt-10">
        <CommercialCategories
          categories={INVEST_CATEGORIES}
          propertiesByCategory={propertiesByCategory}
          basePath="/invest"
        />
      </div>
    </div>
  );
}
