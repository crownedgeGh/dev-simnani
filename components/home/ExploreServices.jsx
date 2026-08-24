import Link from "next/link";

const SERVICES = [
  {
    title: "Buy Property",
    description:
      "Find your perfect home, apartment, villa, plot or commercial property.",
    cta: "Explore Properties",
    href: "/buy",
  },
  {
    title: "Sell Property",
    description: "List your property and connect with genuine buyers.",
    cta: "Sell Your Property",
    href: "/sell",
  },
  {
    title: "Rent Property",
    description:
      "Find residential and commercial properties available for rent.",
    cta: "Find Rental Properties",
    href: "/rent",
  },
  {
    title: "Invest in Real Estate",
    description:
      "Explore property investment opportunities designed for long-term growth.",
    cta: "Explore Investments",
    href: "/invest",
  },
  {
    title: "Project Management",
    description:
      "Professional support for real estate development and property projects.",
    cta: "Explore Projects",
    href: "/",
  },
];

export default function ExploreServices() {
  return (
    <section id="explore" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-center font-display text-2xl text-cream sm:text-3xl">
        Explore <span className="text-gold-400">Simnani Estate</span>
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <div
            key={service.title}
            className="border border-navy-700/60 bg-navy-900 p-6 transition hover:border-gold-500/50"
          >
            <h3 className="font-display text-lg text-cream">
              {service.title}
            </h3>
            <p className="mt-2 text-sm text-muted">{service.description}</p>
            <Link
              href={service.href}
              className="tracked-label mt-5 inline-block text-xs text-gold-400 transition hover:text-gold-300"
            >
              {service.cta} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
