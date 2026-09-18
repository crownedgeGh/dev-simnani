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
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-gold-400/10 font-display text-lg text-gold-400">
      {getInitials(name)}
    </div>
  );
}

export default async function FeaturedBrokers() {
  const brokers = await getFeaturedBrokers();

  if (!brokers.length) return null;

  return (
    <section className="bg-navy-950 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-4xl text-cream sm:text-5xl">
            Preferred Agents
          </h2>
          <p className="mt-4 text-sm text-muted">
            Meet our top-rated, premium real estate partners.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {brokers.map((broker) => (
            <div
              key={broker.accountId}
              className="rounded-sm border border-navy-700/60 bg-navy-900 p-5 transition hover:border-gold-500/60"
            >
              <div className="flex items-center gap-3">
                <BrokerAvatar name={broker.fullName} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-display text-lg text-cream">
                      {broker.fullName}
                    </p>
                    <MdVerified className="shrink-0 text-gold-400" size={16} />
                  </div>
                  <p className="truncate text-xs text-muted">
                    {[broker.city, broker.state].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
              </div>

              {broker.agencyName && (
                <div className="mt-4 flex items-center gap-2 border-t border-navy-800 pt-4 text-sm text-muted">
                  <BiBuildingHouse className="shrink-0 text-gold-400" size={16} />
                  <span className="truncate">{broker.agencyName}</span>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-navy-800 pt-4">
                <div>
                  <p className="font-display text-xl text-gold-400">
                    {broker.experience || "—"}
                  </p>
                  <p className="text-xs text-muted">Experience</p>
                </div>
                <div>
                  <p className="font-display text-xl text-gold-400">
                    {broker.propertiesListed}
                  </p>
                  <p className="text-xs text-muted">Properties Listed</p>
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
