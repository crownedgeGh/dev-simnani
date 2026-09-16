"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdApartment,
  MdPeople,
  MdLeaderboard,
  MdAttachMoney,
  MdOpenInNew,
  MdChevronRight,
  MdCalendarToday,
  MdBookmarkBorder,
  MdVisibility,
  MdOutlineMap,
} from "react-icons/md";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";

export default function UserPortalSnapshot({ accountId }) {
  const [fetched, setFetched] = useState({ forId: null, data: null });
  const [tab, setTab] = useState(null);

  useEffect(() => {
    if (!accountId) return;
    let active = true;
    (async () => {
      let result = null;
      try {
        const res = await fetch(`/api/users/${accountId}/portal`, { cache: "no-store" });
        const json = await res.json();
        if (json.success) result = json.data;
      } catch (err) {
        console.error("Failed to fetch portal snapshot:", err);
      }
      if (active) setFetched({ forId: accountId, data: result });
    })();
    return () => {
      active = false;
    };
  }, [accountId]);

  const loading = fetched.forId !== accountId;
  const data = loading ? null : fetched.data;

  const tabs = useMemo(() => tabsForKind(data?.kind), [data?.kind]);
  const activeTab = tab && tabs.some((t) => t.key === tab) ? tab : tabs[0]?.key;

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#e8e0d5] bg-white p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[#f0ebe3] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.kind === "unknown") {
    return (
      <div className="rounded-2xl border border-[#e8e0d5] bg-white p-6 text-center">
        <p className="text-sm text-[#9ca3af]">No portal activity available for this account type.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e8e0d5] bg-white p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#1a1a2e]">Portal Snapshot</h3>
        <span className="rounded-full bg-[#fff8e1] px-2.5 py-0.5 text-xs font-semibold text-[#d97706] border border-[#f0b429]/30">
          Live from public portal
        </span>
      </div>

      {tabs.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-1.5 border-b border-[#f0ebe3] pb-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`min-h-[36px] rounded-full px-3.5 text-xs font-medium transition ${
                activeTab === t.key
                  ? "bg-[#1a1a2e] text-white"
                  : "bg-[#faf8f5] text-[#6b7280] hover:bg-[#f0ebe3]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div>{renderTabContent(data, activeTab)}</div>
    </div>
  );
}

function tabsForKind(kind) {
  switch (kind) {
    case "owner":
      return [
        { key: "overview", label: "Overview" },
        { key: "listings", label: "Listings" },
        { key: "leads", label: "Leads" },
        { key: "clients", label: "Clients" },
        { key: "commissions", label: "Commissions" },
      ];
    case "buyer":
      return [
        { key: "overview", label: "Overview" },
        { key: "saved", label: "Saved Properties" },
        { key: "interested", label: "I'm Interested" },
        { key: "recommended", label: "Recommended Properties" },
      ];
    case "investor":
      return [
        { key: "overview", label: "Overview" },
        { key: "saved", label: "Saved Properties" },
        { key: "interested", label: "I'm Interested" },
        { key: "opportunities", label: "Investment Opportunities" },
      ];
    case "employee":
      return [
        { key: "overview", label: "Overview" },
        { key: "leads", label: "Leads" },
        { key: "visits", label: "Site Visits" },
        { key: "performance", label: "Performance & Territory" },
      ];
    case "freelancer":
      return [
        { key: "overview", label: "Overview" },
        { key: "leads", label: "Leads" },
        { key: "network", label: "Network" },
        { key: "commissions", label: "Commissions" },
      ];
    default:
      return [];
  }
}

function renderTabContent(data, tab) {
  switch (data.kind) {
    case "owner":
      return <OwnerTabs data={data} tab={tab} />;
    case "buyer":
      return <BuyerTabs data={data} tab={tab} />;
    case "investor":
      return <InvestorTabs data={data} tab={tab} />;
    case "employee":
      return <EmployeeTabs data={data} tab={tab} />;
    case "freelancer":
      return <FreelancerTabs data={data} tab={tab} />;
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Shared primitives                                                          */
/* -------------------------------------------------------------------------- */

function KpiGrid({ items }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
      {items.map((item) => (
        <AdminKpiCard key={item.title} {...item} />
      ))}
    </div>
  );
}

function EmptyRow({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-[#e8e0d5] px-4 py-10 text-center">
      <p className="text-sm text-[#9ca3af]">{message}</p>
    </div>
  );
}

function Row({ title, subtitle, meta, status, right, href, external = false }) {
  const content = (
    <div className="flex flex-col gap-2 rounded-xl border border-[#f0ebe3] p-3.5 transition hover:border-[#e8e0d5] hover:bg-[#faf8f5] sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#1a1a2e]">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-xs text-[#9ca3af]">{subtitle}</p>}
        {meta && <p className="mt-1 text-[11px] text-[#9ca3af]">{meta}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {status && <AdminStatusBadge status={status} />}
        {right}
        {href && (external ? (
          <MdOpenInNew size={14} className="text-[#9ca3af]" />
        ) : (
          <MdChevronRight size={16} className="text-[#9ca3af]" />
        ))}
      </div>
    </div>
  );

  if (href) {
    return external ? (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </Link>
    ) : (
      <Link href={href}>{content}</Link>
    );
  }
  return content;
}

function PropertyTileGrid({ properties, emptyMessage }) {
  if (!properties?.length) return <EmptyRow message={emptyMessage} />;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p) => (
        <Link
          key={p.id}
          href={`/property/${p.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-xl border border-[#f0ebe3] bg-white transition hover:border-[#e8e0d5] hover:shadow-md"
        >
          <div className="relative h-36 w-full bg-[#f0ebe3]">
            {p.image && (
              <Image
                src={p.image}
                alt={p.title}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition group-hover:scale-105"
              />
            )}
          </div>
          <div className="p-3.5">
            <p className="truncate text-sm font-medium text-[#1a1a2e]">{p.title}</p>
            <p className="mt-0.5 truncate text-xs text-[#9ca3af]">{p.location}</p>
            <p className="mt-1.5 text-sm font-semibold text-[#d97706]">{p.price}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Owner (broker / common-person)                                             */
/* -------------------------------------------------------------------------- */

function OwnerTabs({ data, tab }) {
  const { stats, listings, leads, clients, commissions } = data;

  if (tab === "overview") {
    return (
      <div className="flex flex-col gap-5">
        <KpiGrid
          items={[
            { title: "Active Listings", value: stats.activeListings, icon: MdApartment, color: "gold" },
            { title: "Total Leads", value: stats.totalLeads, icon: MdLeaderboard, color: "blue" },
            { title: "Site Visits", value: stats.siteVisits, icon: MdCalendarToday, color: "green" },
            { title: "Closed Deals", value: stats.closedDeals, icon: MdAttachMoney, color: "purple" },
          ]}
        />
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Recent Listings</p>
          {listings.length === 0 ? (
            <EmptyRow message="No listings yet." />
          ) : (
            <div className="flex flex-col gap-2">
              {listings.slice(0, 3).map((l) => (
                <Row
                  key={l._id || l.id}
                  title={l.title}
                  subtitle={l.location}
                  status={l.status}
                  href={l.id ? `/admin/properties/${l.id}` : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (tab === "listings") {
    return (
      <div className="flex flex-col gap-2">
        {listings.length === 0 ? (
          <EmptyRow message="No listings yet." />
        ) : (
          listings.map((l) => (
            <Row
              key={l._id || l.id}
              title={l.title}
              subtitle={`${l.location || "—"} · ${l.price || "—"}`}
              status={l.status}
              href={l.id ? `/admin/properties/${l.id}` : undefined}
            />
          ))
        )}
      </div>
    );
  }

  if (tab === "leads") {
    return (
      <div className="flex flex-col gap-2">
        {leads.length === 0 ? (
          <EmptyRow message="No leads yet." />
        ) : (
          leads.map((l) => (
            <Row
              key={l._id || l.id}
              title={l.name}
              subtitle={`${l.phone || "—"} · Interested in ${l.interest || "—"}`}
              meta={`${l.source || "—"} · ${l.date || "—"}`}
              status={l.status}
            />
          ))
        )}
      </div>
    );
  }

  if (tab === "clients") {
    return (
      <div className="flex flex-col gap-2">
        {clients.length === 0 ? (
          <EmptyRow message="No clients yet." />
        ) : (
          clients.map((c) => (
            <Row
              key={c._id || c.id || c.name}
              title={c.name}
              subtitle={`${c.phone || "—"} · ${c.property || "—"}`}
              meta={c.lastActivity}
              status={c.status}
            />
          ))
        )}
      </div>
    );
  }

  if (tab === "commissions") {
    return (
      <div className="flex flex-col gap-2">
        {commissions.length === 0 ? (
          <EmptyRow message="No commissions recorded yet." />
        ) : (
          commissions.map((c) => (
            <Row
              key={c.property}
              title={c.property}
              subtitle={`Deal: ${c.dealStatus}`}
              status={c.commissionStatus}
              right={<span className="text-sm font-semibold text-[#d97706]">{c.amount}</span>}
            />
          ))
        )}
      </div>
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Buyer                                                                      */
/* -------------------------------------------------------------------------- */

function BuyerTabs({ data, tab }) {
  const { stats, recommended, interested = [], saved = [] } = data;

  if (tab === "overview") {
    return (
      <div className="flex flex-col gap-5">
        <KpiGrid
          items={[
            { title: "Saved Properties", value: stats.saved, icon: MdBookmarkBorder, color: "gold" },
            { title: "I'm Interested", value: stats.interested, icon: MdVisibility, color: "blue" },
            { title: "Recommended Matches", value: stats.recommended, icon: MdLeaderboard, color: "green" },
          ]}
        />
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Saved Properties</p>
          <PropertyTileGrid properties={saved.slice(0, 3)} emptyMessage="No properties saved yet." />
        </div>
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">I&apos;m Interested</p>
          <InterestedList leads={interested.slice(0, 3)} />
        </div>
      </div>
    );
  }

  if (tab === "saved") {
    return <PropertyTileGrid properties={saved} emptyMessage="No properties saved yet." />;
  }

  if (tab === "interested") {
    return <InterestedList leads={interested} />;
  }

  if (tab === "recommended") {
    return <PropertyTileGrid properties={recommended} emptyMessage="No recommendations available." />;
  }

  return null;
}

function InterestedList({ leads }) {
  if (!leads?.length) return <EmptyRow message="No properties marked as interested yet." />;
  return (
    <div className="flex flex-col gap-2">
      {leads.map((lead) => (
        <Row
          key={lead.id}
          title={lead.title}
          subtitle={`${lead.location || "—"} · ${lead.price || "—"}`}
          meta={lead.date}
          status={lead.status}
          href={`/property/${lead.id}`}
          external
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Investor                                                                   */
/* -------------------------------------------------------------------------- */

function InvestorTabs({ data, tab }) {
  const { stats, opportunities, saved = [], interested = [] } = data;

  if (tab === "overview") {
    return (
      <div className="flex flex-col gap-5">
        <KpiGrid
          items={[
            { title: "Saved Properties", value: stats.saved, icon: MdBookmarkBorder, color: "gold" },
            { title: "I'm Interested", value: stats.interested, icon: MdVisibility, color: "blue" },
            { title: "Matching Opportunities", value: stats.opportunities, icon: MdApartment, color: "green" },
          ]}
        />
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Saved Properties</p>
          <PropertyTileGrid properties={saved.slice(0, 3)} emptyMessage="No properties saved yet." />
        </div>
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Recommended Investments</p>
          <PropertyTileGrid properties={opportunities.slice(0, 3)} emptyMessage="No opportunities available." />
        </div>
      </div>
    );
  }

  if (tab === "saved") {
    return <PropertyTileGrid properties={saved} emptyMessage="No properties saved yet." />;
  }

  if (tab === "interested") {
    return <InterestedList leads={interested} />;
  }

  if (tab === "opportunities") {
    return <PropertyTileGrid properties={opportunities} emptyMessage="No opportunities available." />;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Employee                                                                   */
/* -------------------------------------------------------------------------- */

function EmployeeTabs({ data, tab }) {
  const { stats, leads, siteVisits, salesTarget, performance, territory } = data;

  if (tab === "overview") {
    return (
      <KpiGrid
        items={[
          { title: "Assigned Leads", value: stats.totalAssignedLeads, subtitle: `${stats.newLeads} new`, icon: MdLeaderboard, color: "gold" },
          { title: "Follow-ups Due Today", value: stats.followUpsDueToday, icon: MdCalendarToday, color: "orange" },
          { title: "Site Visits", value: stats.siteVisitsScheduled, subtitle: `${stats.siteVisitsCompleted} completed`, icon: MdOutlineMap, color: "blue" },
          { title: "Bookings", value: stats.bookings, subtitle: stats.monthSalesValue, icon: MdAttachMoney, color: "green" },
        ]}
      />
    );
  }

  if (tab === "leads") {
    return (
      <div className="flex flex-col gap-2">
        {leads.length === 0 ? (
          <EmptyRow message="No assigned leads." />
        ) : (
          leads.map((l) => (
            <Row
              key={l.id}
              title={l.name}
              subtitle={`${l.phone} · ${l.property}`}
              meta={`${l.source} · ${l.date} · Next: ${l.nextFollowUp}`}
              status={l.status}
            />
          ))
        )}
      </div>
    );
  }

  if (tab === "visits") {
    return (
      <div className="flex flex-col gap-2">
        {siteVisits.length === 0 ? (
          <EmptyRow message="No site visits scheduled." />
        ) : (
          siteVisits.map((v) => (
            <Row
              key={v.id}
              title={v.customer}
              subtitle={v.property}
              meta={v.time}
              status={v.status}
            />
          ))
        )}
      </div>
    );
  }

  if (tab === "performance") {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Leads", performance.leads],
            ["Contacted", performance.contacted],
            ["Site Visits", performance.siteVisits],
            ["Conversion", performance.conversionRate],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#f0ebe3] p-3.5">
              <p className="text-xs text-[#9ca3af]">{label}</p>
              <p className="mt-1 text-lg font-semibold text-[#1a1a2e]">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-[#f0ebe3] p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Sales Target · {performance.month}</p>
          <div className="mt-2 flex items-center justify-between text-sm text-[#374151]">
            <span>Achieved {salesTarget.achievedLabel}</span>
            <span className="text-[#9ca3af]">of {salesTarget.monthlyTargetLabel}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#f0ebe3]">
            <div
              className="h-full rounded-full bg-[#f0b429]"
              style={{ width: `${Math.min(100, (salesTarget.achieved / salesTarget.monthlyTarget) * 100)}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-[#f0ebe3] p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">Territory</p>
          <p className="mt-1.5 text-sm text-[#374151]">District: {territory.district}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {territory.cities.map((c) => (
              <span key={c} className="rounded-full bg-[#faf8f5] px-2.5 py-1 text-xs text-[#6b7280] border border-[#f0ebe3]">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Freelancer / Channel Partner                                               */
/* -------------------------------------------------------------------------- */

function FreelancerTabs({ data, tab }) {
  const { stats, leads, network, commissions } = data;

  if (tab === "overview") {
    return (
      <KpiGrid
        items={[
          { title: "Total Leads", value: stats.company.totalLeads, icon: MdLeaderboard, color: "gold" },
          { title: "Pending Verification", value: stats.company.pendingVerification, icon: MdCalendarToday, color: "orange" },
          { title: "Active Assignments", value: stats.company.activeAssignments, icon: MdOutlineMap, color: "blue" },
          { title: "Commission Pending", value: stats.company.commissionPendingApproval, icon: MdAttachMoney, color: "purple" },
        ]}
      />
    );
  }

  if (tab === "leads") {
    return (
      <div className="flex flex-col gap-2">
        {leads.length === 0 ? (
          <EmptyRow message="No leads submitted." />
        ) : (
          leads.map((l) => (
            <Row
              key={l.id}
              title={l.customer}
              subtitle={`${l.phone} · ${l.project}`}
              meta={`${l.source} · ${l.date} · by ${l.submittedBy?.name || "—"}`}
              status={l.status}
            />
          ))
        )}
      </div>
    );
  }

  if (tab === "network") {
    return (
      <div className="flex flex-col gap-2">
        {network.length === 0 ? (
          <EmptyRow message="No network partners." />
        ) : (
          network.map((n) => (
            <Row
              key={n.id}
              title={n.name}
              subtitle={`${n.leadsSubmitted} leads · ${n.siteVisits} visits · ${n.dealsClosed} deals closed`}
              status={n.cpType}
            />
          ))
        )}
      </div>
    );
  }

  if (tab === "commissions") {
    return (
      <div className="flex flex-col gap-2">
        {commissions.length === 0 ? (
          <EmptyRow message="No commissions recorded yet." />
        ) : (
          commissions.map((c) => (
            <Row
              key={c.leadId}
              title={c.customer}
              subtitle={c.project}
              status={c.approvalStatus}
              right={<span className="text-sm font-semibold text-[#d97706]">{c.amount}</span>}
            />
          ))
        )}
      </div>
    );
  }

  return null;
}
