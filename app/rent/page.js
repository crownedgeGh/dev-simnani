import PropertyFilterBar from "@/components/property/PropertyFilterBar";
import { getPropertiesByType } from "@/lib/propertiesServer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rent Property | Simnani Estate",
  description:
    "Find residential and commercial properties available for rent.",
};

export default async function RentPage() {
  const properties = await getPropertiesByType("rent");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Rent Property
        </h1>
      </div>

      <div className="mt-10">
        <PropertyFilterBar
          properties={properties}
          pricingMode="rent"
          emptyMessage="No rental properties available right now. Check back soon."
          emphasizeDetails
        />
      </div>
    </div>
  );
}
