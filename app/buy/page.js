import PropertyGrid from "@/components/property/PropertyGrid";
import { getPropertiesByType } from "@/lib/properties";

export const metadata = {
  title: "Buy Property | Simnani Estate",
  description:
    "Find your perfect home, apartment, villa, plot or commercial property.",
};

export default async function BuyPage({ searchParams }) {
  const params = await searchParams;
  const properties = getPropertiesByType("buy");

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Buy Property
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Find your perfect home, apartment, villa, plot or commercial
          property.
          {params?.location ? ` Showing results near "${params.location}".` : ""}
        </p>
      </div>

      <div className="mt-10">
        <PropertyGrid
          properties={properties}
          emptyMessage="No properties available for sale right now. Check back soon."
        />
      </div>
    </div>
  );
}
