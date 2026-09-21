import { getFeaturedBrokers } from "@/lib/brokersServer";
import BrokersScroller from "@/components/home/BrokersScroller";

const MAX_VISIBLE_BROKERS = 10;

export default async function FeaturedBrokers() {
  const brokers = await getFeaturedBrokers();

  if (!brokers.length) return null;

  const visibleBrokers = brokers.slice(0, MAX_VISIBLE_BROKERS);

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24 lg:py-28"
      style={{
        background: "linear-gradient(180deg, #05070c 0%, #0c1020 40%, #0a0e1a 70%, #05070c 100%)",
      }}
    >
      {/* Decorative background glows */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "700px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(255,198,51,0.07) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0"
        style={{
          width: "400px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(255,198,51,0.04) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0"
        style={{
          width: "400px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(255,198,51,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-[-80]">
        {/* Section header */}
        <div className="text-center">
          <span
            className="tracked-label mb-3 inline-block text-xs text-gold-400"
            style={{ letterSpacing: "0.2em" }}
          >
            Our Top Professionals
          </span>
          <h2 className="font-display text-4xl text-cream sm:text-5xl">
            Preferred Agents
          </h2>
          {/* Gold accent underline */}
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-400/60" />
            <div
              className="h-1.5 w-1.5 rounded-full bg-gold-400"
              style={{ boxShadow: "0 0 6px rgba(255,198,51,0.8)" }}
            />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-400/60" />
          </div>
          <p className="mt-4 text-sm text-muted">
            Meet our top-rated, premium real estate partners.
          </p>
        </div>

        <BrokersScroller brokers={visibleBrokers} />
      </div>
    </section>
  );
}
