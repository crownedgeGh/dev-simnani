import Link from "next/link";
import { BiBuildingHouse, BiKey, BiFile } from "react-icons/bi";
import { MdGavel } from "react-icons/md";
import { FiArrowUpRight } from "react-icons/fi";
import { getPropertiesByType } from "@/lib/propertiesServer";
import BackButton from "@/components/layout/BackButton";

export const revalidate = 60;

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
    label: "Lease",
    href: "/lease",
    type: "lease",
    icon: BiFile,
    description: "Retail, office & commercial spaces",
  },
  {
    label: "Seized Property",
    href: "/seized-property",
    type: "seized-property",
    icon: MdGavel,
    description: "Bank-auctioned & SARFAESI listings",
  },
];

export default async function PropertiesPage() {
  const counts = Object.fromEntries(
    await Promise.all(
      CATEGORIES.map(async ({ type }) => [type, (await getPropertiesByType(type)).length])
    )
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="flex items-center gap-3">
        <BackButton href="/" />
        <h1 className="font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
          Properties
        </h1>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {CATEGORIES.map(({ label, href, type, icon: Icon, description }) => {
          const count = counts[type];
          return (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col gap-5 rounded-xl border border-navy-700/60 bg-navy-900 p-6 shadow-lg shadow-black/20 transition duration-300 active:-translate-y-1 active:border-gold-500/70 active:shadow-xl active:shadow-gold-400/5 hover:-translate-y-1 hover:border-gold-500/70 hover:shadow-xl hover:shadow-gold-400/5 sm:p-7"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-linear-to-r from-transparent via-gold-400/70 to-transparent transition duration-300 group-active:scale-x-100 group-hover:scale-x-100"
                aria-hidden="true"
              />

              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/10 text-gold-400 ring-1 ring-gold-400/20 transition duration-300 group-active:bg-gold-400/15 group-active:ring-gold-400/40 group-hover:bg-gold-400/15 group-hover:ring-gold-400/40 sm:h-14 sm:w-14">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <FiArrowUpRight className="h-5 w-5 -translate-x-1 translate-y-1 text-muted opacity-0 transition duration-300 group-active:translate-x-0 group-active:translate-y-0 group-active:text-gold-400 group-active:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-gold-400 group-hover:opacity-100" />
              </div>

              <div>
                <h2 className="font-display text-xl text-cream transition group-active:text-gold-300 group-hover:text-gold-300 sm:text-2xl">
                  {label}
                </h2>
                <p className="mt-2 text-sm text-muted">{description}</p>
              </div>

              <span className="tracked-label inline-block self-start border border-navy-700/60 bg-navy-800 px-3 py-1.5 text-[11px] text-gold-400 transition group-active:border-gold-500/40 group-hover:border-gold-500/40">
                {count} listings
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

