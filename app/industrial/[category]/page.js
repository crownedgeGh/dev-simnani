import { notFound } from "next/navigation";
import PropertyFilterBar from "@/components/property/PropertyFilterBar";
import { INDUSTRIAL_CATEGORIES } from "@/lib/properties";
import { getPropertiesByTypeAndCategory } from "@/lib/propertiesServer";
import BackButton from "@/components/layout/BackButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const match = INDUSTRIAL_CATEGORIES.find((item) => item.key === category);
  if (!match) return {};

  return {
    title: `${match.label} | Simnani Estate`,
    description: `Browse ${match.label.toLowerCase()} listings.`,
  };
}

export default async function IndustrialCategoryPage({ params }) {
  const { category } = await params;
  const match = INDUSTRIAL_CATEGORIES.find((item) => item.key === category);

  if (!match) {
    notFound();
  }

  const properties = await getPropertiesByTypeAndCategory("industrial", category);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="mt-6 flex items-center gap-3 max-w-2xl">
        <BackButton />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          {match.label}
        </h1>
      </div>

      <div className="mt-10">
        <PropertyFilterBar
          properties={properties}
          pricingMode="sale"
          showPropertyType={false}
          emptyMessage="No listings available in this category right now."
        />
      </div>
    </div>
  );
}
