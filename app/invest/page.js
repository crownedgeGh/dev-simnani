import PropertyGrid from "@/components/property/PropertyGrid";
import { getPropertiesByType } from "@/lib/properties";

export const metadata = {
  title: "Invest in Real Estate | Simnani Estate",
  description:
    "Explore property investment opportunities designed for long-term growth.",
};

export default async function InvestPage({ searchParams }) {
  const params = await searchParams;
  const properties = getPropertiesByType("invest");

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Invest in Real Estate
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Explore property investment opportunities designed for long-term
          growth.
          {params?.location ? ` Showing results near "${params.location}".` : ""}
        </p>
      </div>

      <div className="mt-10">
        <PropertyGrid
          properties={properties}
          emptyMessage="No investment opportunities available right now. Check back soon."
        />
      </div>
    </div>
  );
}
