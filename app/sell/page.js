import PropertyFilterBar from "@/components/property/PropertyFilterBar";
import { getPropertiesByType } from "@/lib/propertiesServer";
import BackButton from "@/components/layout/BackButton";
import BrowseByLocalityLinks from "@/components/seo/BrowseByLocalityLinks";
import PostOnCategoryButton from "@/components/property/PostOnCategoryButton";

export const revalidate = 60;

export const metadata = {
  title: "Sell Property | Simnani Estate",
  description: "List your property and connect with genuine buyers.",
};

export default async function SellPage() {
  const properties = await getPropertiesByType("sell");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3 max-w-2xl">
          <BackButton />
          <h1 className="font-display text-3xl text-cream sm:text-4xl">
            Sell Property
          </h1>
        </div>
        <PostOnCategoryButton section="residential" purpose="sale" label="Post Your Property" />
      </div>

      <div className="mt-10">
        <PropertyFilterBar
          properties={properties}
          pricingMode="sale"
          emptyMessage="No owner-listed properties available right now. Check back soon."
        />
      </div>

      <BrowseByLocalityLinks phraseSlug="flats-for-sale" title="Sell-side Listings by Locality" />
    </div>
  );
}
