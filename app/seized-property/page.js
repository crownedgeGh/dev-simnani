import CommercialCategories from "@/components/property/CommercialCategories";
import { SEIZED_PROPERTY_CATEGORIES } from "@/lib/properties";
import { getPropertiesByType } from "@/lib/propertiesServer";
import BackButton from "@/components/layout/BackButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Seized Property | Simnani Estate",
  description:
    "Browse bank-auctioned and SARFAESI seized properties — flats, houses, plots, commercial units, industrial and agricultural land.",
};

export default async function SeizedPropertyPage() {
  const seizedProperties = await getPropertiesByType("seized-property");

  const propertiesByCategory = SEIZED_PROPERTY_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = seizedProperties.filter(
      (property) => property.category === category.key
    );
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="flex items-center gap-3 max-w-2xl">
        <BackButton href="/" />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Seized Property
        </h1>
      </div>

      <div className="mt-10">
        <CommercialCategories
          categories={SEIZED_PROPERTY_CATEGORIES}
          propertiesByCategory={propertiesByCategory}
          basePath="/seized-property"
        />
      </div>
    </div>
  );
}
