import PropertyGrid from "@/components/property/PropertyGrid";
import { getPropertiesByType } from "@/lib/properties";

export const metadata = {
  title: "Industrial Property | Simnani Estate",
  description:
    "Explore warehouses, sheds and industrial spaces for sale and lease.",
};

export default async function IndustrialPage({ searchParams }) {
  const params = await searchParams;
  const properties = getPropertiesByType("industrial");

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Industrial Property
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Explore warehouses, sheds and industrial spaces for sale and lease.
          {params?.location ? ` Showing results near "${params.location}".` : ""}
        </p>
      </div>

      <div className="mt-10">
        <PropertyGrid
          properties={properties}
          emptyMessage="No industrial properties available right now. Check back soon."
        />
      </div>
    </div>
  );
}
