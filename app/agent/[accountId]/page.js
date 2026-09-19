import { notFound } from "next/navigation";
import { MdVerified, MdLocationOn } from "react-icons/md";
import { BiBuildingHouse } from "react-icons/bi";
import { getBrokerByAccountId } from "@/lib/brokersServer";
import { getPropertiesByOwnerId } from "@/lib/propertiesServer";
import BackButton from "@/components/layout/BackButton";
import PropertyGrid from "@/components/property/PropertyGrid";
import CallNowButton from "@/components/home/CallNowButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { accountId } = await params;
  const broker = await getBrokerByAccountId(accountId);
  if (!broker) return {};

  return {
    title: `${broker.fullName} | Simnani Estate`,
    description: `Properties listed by ${broker.fullName}${broker.city ? ` in ${broker.city}` : ""}.`,
  };
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function AgentProfilePage({ params }) {
  const { accountId } = await params;
  const broker = await getBrokerByAccountId(accountId);

  if (!broker) {
    notFound();
  }

  const properties = await getPropertiesByOwnerId(accountId);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="flex items-center gap-3">
        <BackButton href="/" />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          Agent Profile
        </h1>
      </div>

      <div className="mt-8 rounded-sm border border-navy-700/60 bg-navy-900 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="flex items-center gap-4 sm:items-start">
            <div
              className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-xl text-gold-400 sm:h-20 sm:w-20 sm:text-2xl"
              style={{
                background: "radial-gradient(circle, rgba(255,198,51,0.15) 0%, rgba(255,198,51,0.04) 100%)",
                border: "1.5px solid rgba(255,198,51,0.5)",
                boxShadow: "0 0 18px rgba(255,198,51,0.2), inset 0 0 12px rgba(255,198,51,0.06)",
              }}
            >
              {getInitials(broker.fullName)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-display text-xl text-cream sm:text-2xl">{broker.fullName}</p>
                <MdVerified className="shrink-0 text-gold-400" size={18} />
              </div>
              <p className="text-sm text-muted">
                {[broker.city, broker.state].filter(Boolean).join(", ") || "—"}
              </p>
              {broker.agencyName && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <BiBuildingHouse className="shrink-0 text-gold-400" size={15} />
                  {broker.agencyName}
                </p>
              )}
              {broker.officeAddress && (
                <p className="mt-1 hidden max-w-sm items-start gap-1.5 text-sm text-muted sm:flex">
                  <MdLocationOn className="mt-0.5 shrink-0 text-gold-400" size={15} />
                  <span>{broker.officeAddress}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 sm:shrink-0 sm:gap-0 sm:divide-x sm:divide-navy-700/60 sm:rounded-sm sm:border sm:border-navy-700/60 sm:bg-navy-950/40">
            <div className="sm:px-6 sm:py-3 sm:text-center">
              <p className="font-display text-lg text-gold-400">
                {broker.experience
                  ? `${broker.experience} ${Number(broker.experience) === 1 ? "Year" : "Years"}`
                  : "—"}
              </p>
              <p className="text-[11px] text-muted">Experience</p>
            </div>
            <div className="sm:px-6 sm:py-3 sm:text-center">
              <p className="font-display text-lg text-gold-400">{broker.dealsClosed ?? 0}</p>
              <p className="text-[11px] text-muted">Deals Closed</p>
            </div>
            <div className="sm:px-6 sm:py-3 sm:text-center">
              <p className="font-display text-lg text-gold-400">{broker.propertiesListed ?? 0}</p>
              <p className="text-[11px] text-muted">Properties Listed</p>
            </div>
          </div>
        </div>

        <div className="mt-2 sm:mt-8 sm:max-w-xs">
          <CallNowButton mobile={broker.mobile} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-2xl text-cream">Properties Listed</h2>
        <div className="mt-6">
          <PropertyGrid
            properties={properties}
            emptyMessage="This agent hasn't listed any properties yet."
          />
        </div>
      </div>
    </div>
  );
}
