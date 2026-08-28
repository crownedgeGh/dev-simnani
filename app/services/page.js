import Link from "next/link";
import {
  MdHomeWork,
  MdSell,
  MdKey,
  MdTrendingUp,
  MdGavel,
  MdAccountBalance,
  MdRequestQuote,
  MdVideoCameraFront,
  MdApartment,
  MdPublic,
  MdBusinessCenter,
  MdSupportAgent,
  MdStars,
} from "react-icons/md";

const SERVICES = [
  {
    icon: MdHomeWork,
    title: "Property Buying Assistance",
    desc: "End-to-end guidance to find, shortlist and close the right home — from first search to final handover.",
  },
  {
    icon: MdSell,
    title: "Property Selling & Listing",
    desc: "Premium listing exposure, professional photography and a dedicated advisor to secure the best price.",
  },
  {
    icon: MdKey,
    title: "Rental Management",
    desc: "Tenant sourcing, verification, lease drafting and ongoing rent collection support for owners.",
  },
  {
    icon: MdTrendingUp,
    title: "Investment Advisory",
    desc: "Curated high-yield opportunities across residential, commercial and land assets, backed by market research.",
  },
  {
    icon: MdGavel,
    title: "Legal & Documentation Support",
    desc: "Title verification, sale deed drafting and registration assistance from our panel of legal experts.",
  },
  {
    icon: MdAccountBalance,
    title: "Home Loan & Mortgage Assistance",
    desc: "Bank tie-ups for competitive rates, eligibility checks and complete loan paperwork support.",
  },
  {
    icon: MdRequestQuote,
    title: "Property Valuation",
    desc: "Accurate, data-backed valuations to help you price, insure or negotiate with confidence.",
  },
  {
    icon: MdVideoCameraFront,
    title: "Site Visits & Virtual Tours",
    desc: "Scheduled physical site visits and immersive virtual walkthroughs for out-of-town buyers.",
  },
  {
    icon: MdApartment,
    title: "Post-Purchase Property Management",
    desc: "Maintenance coordination, utility transfers and facility management after your deal closes.",
  },
  {
    icon: MdPublic,
    title: "NRI Real Estate Services",
    desc: "Remote transaction handling, power-of-attorney support and repatriation guidance for NRI clients.",
  },
  {
    icon: MdBusinessCenter,
    title: "Commercial & Industrial Solutions",
    desc: "Leasing and acquisition advisory for offices, retail spaces, warehouses and industrial land.",
  },
  {
    icon: MdSupportAgent,
    title: "Dedicated Relationship Manager",
    desc: "A single point of contact guiding you through every stage of your real estate journey.",
  },
];

export const metadata = {
  title: "Services | Simnani Estate",
  description:
    "Explore the full range of real estate services offered by Simnani Estate — buying, selling, renting, investment advisory, legal support and more.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
            Our Services
          </h1>
          <span className="tracked-label inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1 text-xs text-gold-400">
            <MdStars className="h-3.5 w-3.5" />
            What We Offer
          </span>
        </div>
        <p className="mt-4 text-sm text-muted sm:text-base">
          From your first search to long after you move in, Simnani Estate offers a complete
          suite of real estate services designed around a single goal — a seamless, trustworthy
          experience at every step.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="border border-navy-700/60 bg-navy-900 rounded-sm p-6 transition hover:border-gold-400"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-gold-500/40 bg-gold-500/10 text-gold-400">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg text-cream">{title}</h3>
            <p className="mt-2 text-sm text-muted">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-start gap-4 border border-navy-700/60 bg-navy-900 rounded-sm p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="font-display text-xl text-cream sm:text-2xl">
            Need help with something specific?
          </h2>
          <p className="mt-2 text-sm text-muted">
            Talk to our concierge team and we'll match you with the right service.
          </p>
        </div>
        <Link
          href="/request-callback"
          className="tracked-label shrink-0 bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
        >
          Request a Callback
        </Link>
      </div>
    </div>
  );
}
