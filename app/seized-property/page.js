import PropertyGrid from "@/components/property/PropertyGrid";
import { getPropertiesByType } from "@/lib/properties";

export const metadata = {
  title: "Seized Property | Simnani Estate",
  description:
    "Browse bank-auctioned and SARFAESI seized properties at attractive prices.",
};

export default async function SeizedPropertyPage({ searchParams }) {
  const params = await searchParams;
  const properties = getPropertiesByType("seized");

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Seized Property
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Browse bank-auctioned and SARFAESI seized properties at attractive prices.
          {params?.location ? ` Showing results near "${params.location}".` : ""}
        </p>
      </div>

      <div className="mt-10">
        <PropertyGrid
          properties={properties}
          emptyMessage="No seized properties available right now. Check back soon."
        />
      </div>
    </div>
  );
}
