import Link from "next/link";
import {
  BiBuildingHouse,
  BiKey,
  BiTrendingUp,
  BiFile,
  BiBuildings,
} from "react-icons/bi";
import { MdGavel } from "react-icons/md";
import { getPropertiesByType } from "@/lib/properties";

export const metadata = {
  title: "Properties | Simnani Estate",
  description:
    "Choose a category to explore verified buy, rent, invest, lease, seized and industrial property listings.",
};

const CATEGORIES = [
  {
    label: "Buy",
    href: "/buy",
    type: "buy",
    icon: BiBuildingHouse,
    description: "Houses, flats & villas for sale",
  },
  {
    label: "Rent",
    href: "/rent",
    type: "rent",
    icon: BiKey,
    description: "Monthly rental listings",
  },
  {
    label: "Invest",
    href: "/invest",
    type: "invest",
    icon: BiTrendingUp,
    description: "Long-term investment opportunities",
  },
  {
    label: "Lease",
    href: "/lease",
    type: "lease",
    icon: BiFile,
    description: "Retail, office & commercial spaces",
  },
  {
    label: "Seized Property",
    href: "/seized-property",
    type: "seized",
    icon: MdGavel,
    description: "Bank-auctioned & SARFAESI listings",
  },
  {
    label: "Industrial",
    href: "/industrial",
    type: "industrial",
    icon: BiBuildings,
    description: "Warehouses, sheds & industrial spaces",
  },
];

export default function PropertiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="tracked-label text-xs text-gold-400">
          Simnani Estate&apos;s Property Marketplace
        </span>
        <h1 className="mt-3 font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
          What are you looking for?
        </h1>
        <p className="mt-4 text-sm text-muted sm:text-base">
          Choose a category below to explore verified listings.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {CATEGORIES.map(({ label, href, type, icon: Icon, description }) => {
          const count = getPropertiesByType(type).length;
          return (
            <Link
              key={href}
              href={href}
              className="group relative flex min-h-[180px] flex-col justify-between overflow-hidden border border-navy-700/60 bg-navy-900 p-6 transition hover:border-gold-500/70 sm:min-h-[200px] sm:p-8"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold-400/5 transition group-hover:bg-gold-400/10"
                aria-hidden="true"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/10 text-gold-400 transition group-hover:bg-gold-400/15 sm:h-14 sm:w-14">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              <div>
                <h2 className="font-display text-xl text-cream sm:text-2xl">
                  {label}
                </h2>
                <p className="mt-2 text-sm text-muted">{description}</p>
                <span className="tracked-label mt-4 inline-block bg-navy-800 px-3 py-1.5 text-[11px] text-gold-400">
                  {count} listings
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
