import CommercialCategories from "@/components/property/CommercialCategories";
import { AGRICULTURE_CATEGORIES } from "@/lib/properties";
import { getPropertiesByType } from "@/lib/propertiesServer";
import BackButton from "@/components/layout/BackButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Farming Land Projects | Simnani Estate",
  description:
    "Explore farming land by category — farm houses, agricultural land, orchards and plantations.",
};

export default async function FarmingPage() {
  const agricultureProperties = await getPropertiesByType("farming");

  const propertiesByCategory = AGRICULTURE_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = agricultureProperties.filter(
      (property) => property.category === category.key
    );
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="flex items-center gap-3 max-w-2xl">
        <BackButton href="/" />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Farming Land Projects
        </h1>
      </div>

      <div className="mt-10">
        <CommercialCategories
          categories={AGRICULTURE_CATEGORIES}
          propertiesByCategory={propertiesByCategory}
          basePath="/farming"
        />
      </div>
    </div>
  );
}
