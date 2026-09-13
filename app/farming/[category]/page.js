import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import PropertyGrid from "@/components/property/PropertyGrid";
import { AGRICULTURE_CATEGORIES } from "@/lib/properties";
import { getPropertiesByTypeAndCategory } from "@/lib/propertiesServer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const match = AGRICULTURE_CATEGORIES.find((item) => item.key === category);
  if (!match) return {};

  return {
    title: `${match.label} | Simnani Estate`,
    description: `Browse ${match.label.toLowerCase()} listings.`,
  };
}

export default async function FarmingCategoryPage({ params }) {
  const { category } = await params;
  const match = AGRICULTURE_CATEGORIES.find((item) => item.key === category);

  if (!match) {
    notFound();
  }

  const properties = await getPropertiesByTypeAndCategory("farming", category);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <Link
        href="/farming"
        className="tracked-label inline-flex items-center gap-2 text-xs text-muted transition hover:text-gold-400"
      >
        <FiArrowLeft className="h-3.5 w-3.5" />
        Back to Farming Land Projects
      </Link>

      <div className="mt-6 max-w-2xl">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          {match.label}
        </h1>
      </div>

      <div className="mt-10">
        <PropertyGrid
          properties={properties}
          emptyMessage="No listings available in this category right now."
        />
      </div>
    </div>
  );
}
