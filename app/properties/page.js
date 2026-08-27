import Link from "next/link";
import {
  BiBuildingHouse,
  BiKey,
  BiTrendingUp,
  BiFile,
  BiBuildings,
} from "react-icons/bi";
import { MdGavel } from "react-icons/md";
import { FiArrowUpRight } from "react-icons/fi";
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
              className="group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-sm border border-navy-700/60 bg-navy-900 p-6 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-gold-500/70 hover:shadow-xl hover:shadow-gold-400/5 sm:min-h-[210px] sm:p-8"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gold-400/5 transition duration-300 group-hover:bg-gold-400/10"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-linear-to-r from-transparent via-gold-400/70 to-transparent transition duration-300 group-hover:scale-x-100"
                aria-hidden="true"
              />

              <div className="relative flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/10 text-gold-400 ring-1 ring-gold-400/20 transition duration-300 group-hover:bg-gold-400/15 group-hover:ring-gold-400/40 sm:h-14 sm:w-14">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <FiArrowUpRight className="h-5 w-5 -translate-x-1 translate-y-1 text-muted opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-gold-400 group-hover:opacity-100" />
              </div>

              <div className="relative">
                <h2 className="font-display text-xl text-cream transition group-hover:text-gold-300 sm:text-2xl">
                  {label}
                </h2>
                <p className="mt-2 text-sm text-muted">{description}</p>
                <span className="tracked-label mt-4 inline-block border border-navy-700/60 bg-navy-800 px-3 py-1.5 text-[11px] text-gold-400 transition group-hover:border-gold-500/40">
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
