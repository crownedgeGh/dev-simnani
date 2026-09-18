import { BiBuildingHouse } from "react-icons/bi";
import { MdVerified } from "react-icons/md";
import { getFeaturedBrokers } from "@/lib/brokersServer";
import CallNowButton from "@/components/home/CallNowButton";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function BrokerAvatar({ name }) {
  return (
    <div
      className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-xl text-gold-400"
      style={{
        background: "radial-gradient(circle, rgba(255,198,51,0.15) 0%, rgba(255,198,51,0.04) 100%)",
        border: "1.5px solid rgba(255,198,51,0.5)",
        boxShadow: "0 0 18px rgba(255,198,51,0.2), inset 0 0 12px rgba(255,198,51,0.06)",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

export default async function FeaturedBrokers() {
  const brokers = await getFeaturedBrokers();

  if (!brokers.length) return null;

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

      <style>{`
        .broker-card:hover {
          border-color: rgba(255,198,51,0.35) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(255,198,51,0.08) !important;
          transform: translateY(-4px);
        }
      `}</style>

        {/* Cards grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {brokers.map((broker) => (
            <div
              key={broker.accountId}
              className="broker-card relative flex flex-col rounded-xl p-5 transition-all duration-300"
              style={{
                background: "linear-gradient(145deg, #0f1628 0%, #0a0e1a 100%)",
                border: "1px solid rgba(27,39,64,0.8)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              {/* Gold top accent bar */}
              <div
                className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,198,51,0.6), transparent)",
                }}
              />

              {/* Broker info */}
              <div className="flex items-center gap-3">
                <BrokerAvatar name={broker.fullName} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-display text-base text-cream">
                      {broker.fullName}
                    </p>
                    <MdVerified className="shrink-0 text-gold-400" size={15} />
                  </div>
                  <p className="truncate text-xs text-muted">
                    {[broker.city, broker.state].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
              </div>

              {/* Agency */}
              {broker.agencyName && (
                <div
                  className="mt-4 flex items-center gap-2 pt-4 text-sm text-muted"
                  style={{ borderTop: "1px solid rgba(17,26,44,0.8)" }}
                >
                  <BiBuildingHouse className="shrink-0 text-gold-400" size={15} />
                  <span className="truncate">{broker.agencyName}</span>
                </div>
              )}

              {/* Stats */}
              <div
                className="mt-4 grid grid-cols-3 gap-2 pt-4"
                style={{ borderTop: "1px solid rgba(17,26,44,0.8)" }}
              >
                <div>
                  <p className="font-display text-base sm:text-lg text-gold-400">
                    {broker.experience || "—"}
                  </p>
                  <p className="text-[11px] text-muted">Experience</p>
                </div>
                <div>
                  <p className="font-display text-base sm:text-lg text-gold-400">
                    {broker.dealsClosed ?? 0}
                  </p>
                  <p className="text-[11px] text-muted">Deals Closed</p>
                </div>
                <div>
                  <p className="font-display text-base sm:text-lg text-gold-400">
                    {broker.propertiesListed ?? 0}
                  </p>
                  <p className="text-[11px] text-muted">Properties</p>
                </div>
              </div>

              <CallNowButton mobile={broker.mobile} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
