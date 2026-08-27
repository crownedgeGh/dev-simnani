import Link from "next/link";
import PropertyFilterBar from "@/components/property/PropertyFilterBar";
import { getPropertiesByType } from "@/lib/properties";

export const metadata = {
  title: "Sell Property | Simnani Estate",
  description: "List your property and connect with genuine buyers.",
};

export default async function SellPage({ searchParams }) {
  const params = await searchParams;
  const properties = getPropertiesByType("sell");

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl text-cream sm:text-4xl">
            Sell Property
          </h1>
          <p className="mt-3 text-sm text-muted sm:text-base">
            List your property and connect with genuine buyers.
            {params?.location ? ` Showing results near "${params.location}".` : ""}
          </p>
        </div>
        <Link
          href="/post-property"
          className="tracked-label w-full shrink-0 bg-gold-400 px-6 py-3.5 text-center text-xs text-navy-950 transition hover:bg-gold-300 sm:w-auto"
        >
          Post Your Property
        </Link>
      </div>

      <div className="mt-10">
        <PropertyFilterBar
          properties={properties}
          pricingMode="sale"
          emptyMessage="No owner-listed properties available right now. Check back soon."
        />
      </div>
    </div>
  );
}
