import PropertyFilterBar from "@/components/property/PropertyFilterBar";
import { getPropertiesByType } from "@/lib/propertiesServer";
import BackButton from "@/components/layout/BackButton";
import PostOnCategoryButton from "@/components/property/PostOnCategoryButton";

export const revalidate = 60; // cache listing HTML for 60s instead of hitting Mongo on every request

export const metadata = {
  title: "Plot / Land | Simnani Estate",
  description:
    "Browse plots and land for sale — residential, commercial, agricultural, industrial and investment.",
};

export default async function PlotLandPage() {
  const properties = await getPropertiesByType("plot-land");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3 max-w-2xl">
          <BackButton href="/" />
          <h1 className="font-display text-3xl text-cream sm:text-4xl">
            Plot / Land
          </h1>
        </div>
        <PostOnCategoryButton section="plot-land" />
      </div>

      <div className="mt-10">
        <PropertyFilterBar
          properties={properties}
          pricingMode="sale"
          showPropertyType={false}
          emptyMessage="No plots or land listed right now. Check back soon."
        />
      </div>
    </div>
  );
}
