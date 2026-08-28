import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import PropertyGrid from "@/components/property/PropertyGrid";
import { INDUSTRIAL_CATEGORIES, getIndustrialPropertiesByCategory } from "@/lib/properties";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const match = INDUSTRIAL_CATEGORIES.find((item) => item.key === category);
  if (!match) return {};

  return {
    title: `${match.label} | Simnani Estate`,
    description: `Browse ${match.label.toLowerCase()} listings.`,
  };
}

export default async function IndustrialCategoryPage({ params }) {
  const { category } = await params;
  const match = INDUSTRIAL_CATEGORIES.find((item) => item.key === category);

  if (!match) {
    notFound();
  }

  const properties = getIndustrialPropertiesByCategory(category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/industrial"
        className="tracked-label inline-flex items-center gap-2 text-xs text-muted transition hover:text-gold-400"
      >
        <FiArrowLeft className="h-3.5 w-3.5" />
        Back to Industrial
      </Link>

      <div className="mt-6 max-w-2xl">
        <span className="tracked-label text-xs text-gold-400">Industrial</span>
        <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl">
          {match.label}
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Handpicked {match.label.toLowerCase()} listings.
        </p>
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
