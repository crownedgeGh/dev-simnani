import PropertyFilterBar from "@/components/property/PropertyFilterBar";
import { getPropertiesByType } from "@/lib/propertiesServer";
import BackButton from "@/components/layout/BackButton";
import PostOnCategoryButton from "@/components/property/PostOnCategoryButton";

export const revalidate = 60; // cache listing HTML for 60s instead of hitting Mongo on every request

export const metadata = {
  title: "Lease Property | Simnani Estate",
  description:
    "Find retail, office and commercial spaces available on lease.",
};

export default async function LeasePage() {
  const properties = await getPropertiesByType("lease");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3 max-w-2xl">
          <BackButton />
          <h1 className="font-display text-3xl text-cream sm:text-4xl">
            Lease Property
          </h1>
        </div>
        <PostOnCategoryButton section="residential" purpose="lease" />
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
