import CommercialCategories from "@/components/property/CommercialCategories";
import { INDUSTRIAL_CATEGORIES } from "@/lib/properties";
import { getPropertiesByType } from "@/lib/propertiesServer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Industrial Property | Simnani Estate",
  description:
    "Explore warehouses, sheds and industrial spaces for sale and lease.",
};

export default async function IndustrialPage() {
  const industrialProperties = await getPropertiesByType("industrial");

  const propertiesByCategory = INDUSTRIAL_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = industrialProperties.filter(
      (property) => property.category === category.key
    );
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Industrial
        </h1>
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
