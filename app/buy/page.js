import PropertyFilterBar from "@/components/property/PropertyFilterBar";
import { getPropertiesByType } from "@/lib/propertiesServer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Buy Property | Simnani Estate",
  description:
    "Find your perfect home, apartment, villa, plot or commercial property.",
};

export default async function BuyPage() {
  const properties = await getPropertiesByType("buy");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Buy Property
        </h1>
      </div>

      <div className="mt-10">
        <PropertyFilterBar
          properties={properties}
          pricingMode="sale"
          emptyMessage="No properties available for sale right now. Check back soon."
          emphasizeDetails
        />
      </div>
    </div>
  );
}
