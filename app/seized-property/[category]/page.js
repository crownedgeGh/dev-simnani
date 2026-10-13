import { notFound } from "next/navigation";
import PurposeTabs, { PurposeTabSwitcher } from "@/components/property/PurposeTabs";
import { SEIZED_PROPERTY_CATEGORIES } from "@/lib/properties";
import { getPropertiesByTypeAndCategory } from "@/lib/propertiesServer";
import BackButton from "@/components/layout/BackButton";
import PostOnCategoryButton from "@/components/property/PostOnCategoryButton";

const TAB_PURPOSE = { buy: "sale", rent: "rent", lease: "lease" };

export const revalidate = 60; // cache listing HTML for 60s instead of hitting Mongo on every request

export async function generateMetadata({ params }) {
  const { category } = await params;
  const match = SEIZED_PROPERTY_CATEGORIES.find((item) => item.key === category);
  if (!match) return {};

  return {
    title: `${match.label} | Simnani Estate`,
    description: `Browse ${match.label.toLowerCase()} listed under bank-auctioned and SARFAESI seized property.`,
  };
}

export default async function SeizedPropertyCategoryPage({ params, searchParams }) {
  const { category } = await params;
  const match = SEIZED_PROPERTY_CATEGORIES.find((item) => item.key === category);

  if (!match) {
    notFound();
  }

  const properties = await getPropertiesByTypeAndCategory("seized-property", category);
  const { purpose: tab } = await searchParams;
  const purpose = TAB_PURPOSE[tab] || "sale";

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="font-display text-3xl text-cream sm:text-4xl">
            {match.label}
          </h1>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
          <PurposeTabSwitcher />
          <PostOnCategoryButton section="seized-property" category={category} purpose={purpose} />
        </div>
      </div>

      <div className="mt-6">
        <PurposeTabs properties={properties} emptyLabel="listings" />
      </div>
    </div>
  );
}
