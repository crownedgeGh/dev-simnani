import Link from "next/link";
import CommercialCategories from "@/components/property/CommercialCategories";
import { INVEST_CATEGORIES } from "@/lib/properties";
import { getPropertiesByType } from "@/lib/propertiesServer";
import { PROJECTS } from "@/lib/projects";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Investment Properties | Simnani Estate",
  description:
    "High-yield and capital-growth real estate investment opportunities.",
};

export default async function InvestPage() {
  const investProperties = await getPropertiesByType("invest");

  const propertiesByCategory = INVEST_CATEGORIES.reduce((acc, category) => {
    acc[category.key] = investProperties.filter(
      (property) => property.category === category.key
    );
    return acc;
  }, {});

  const categories = [
    ...INVEST_CATEGORIES,
    {
      key: "company-project",
      label: "Company Projects",
      icon: "MdBusiness",
      href: "/projects",
      count: PROJECTS.length,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="tracked-label text-xs text-gold-400">Invest</span>
        <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl">
          Explore by Investment Category
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Browse long-term investment opportunities by property type — shops,
          land, farmhouses, offices and apartments.
        </p>
      </div>

      <div className="mt-10">
        <CommercialCategories
          categories={categories}
          propertiesByCategory={propertiesByCategory}
          basePath="/invest"
        />
      </div>
    </div>
  );
}
