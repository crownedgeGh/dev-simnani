import Link from "next/link";
import CommercialCategories from "@/components/property/CommercialCategories";
import { INVEST_CATEGORIES } from "@/lib/properties";
import { getPropertiesByType } from "@/lib/propertiesServer";
import { PROJECTS } from "@/lib/projects";
import BackButton from "@/components/layout/BackButton";

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
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="flex items-center gap-3 max-w-2xl">
        <BackButton href="/" />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Invest
        </h1>
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
