import PropertyFilterBar from "@/components/property/PropertyFilterBar";
import { getPropertiesByType } from "@/lib/properties";

export const metadata = {
  title: "Lease Property | Simnani Estate",
  description:
    "Find retail, office and commercial spaces available on lease.",
};

export default async function LeasePage({ searchParams }) {
  const params = await searchParams;
  const properties = getPropertiesByType("lease");

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Lease Property
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Find retail, office and commercial spaces available on lease.
          {params?.location ? ` Showing results near "${params.location}".` : ""}
        </p>
      </div>

      <div className="mt-10">
        <PropertyFilterBar
          properties={properties}
          pricingMode="rent"
          emptyMessage="No lease properties available right now. Check back soon."
        />
      </div>
    </div>
  );
}
