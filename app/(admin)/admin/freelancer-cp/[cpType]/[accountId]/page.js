"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MdArrowBack,
  MdPerson,
  MdPhone,
  MdDirectionsWalk,
  MdCameraAlt,
  MdCheckCircle,
  MdSend,
  MdInbox,
  MdAssignmentInd,
  MdLeaderboard,
  MdLink,
  MdAttachMoney,
} from "react-icons/md";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";

const LEVEL_FOR_CP_TYPE = { company: "head-to-company", field: "company-to-field", digital: "company-to-digital" };
const CP_TYPE_TITLES = { company: "Company CP", digital: "Digital CP", field: "Field CP" };

async function getJSON(url) {
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function Section({ title, count, icon: Icon, children }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-[#d97706]" />
        <h4 className="text-sm font-semibold text-[#1a1a2e]">{title}</h4>
        <span className="rounded-full bg-[#f0ebe3] px-1.5 py-0.5 text-[10px] text-[#9ca3af]">{count}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ message }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#e8e0d5] py-8">
      <MdInbox size={22} className="text-[#c9c3bc]" />
      <p className="text-xs text-[#9ca3af]">{message}</p>
    </div>
  );
}

function TimelineRow({ icon: Icon, label, time }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="flex items-center gap-1.5 text-[#374151]">
        <Icon size={13} className="shrink-0 text-[#d97706]" />
        {label}
      </span>
      <span className="shrink-0 text-[#9ca3af]">{time || "—"}</span>
    </div>
  );
}

function VisitCard({ visit }) {
  return (
    <div className="rounded-2xl border border-[#e8e0d5] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#1a1a2e]">{visit.customer || "Untitled visit"}</p>
          <p className="mt-0.5 text-xs text-[#9ca3af]">{visit.project || "—"}</p>
          <p className="mt-0.5 text-xs text-[#9ca3af]">{visit.scheduledAt}</p>
        </div>
        <AdminStatusBadge status={visit.status} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 border-t border-[#f0ebe3] pt-3 sm:grid-cols-2">
        <p className="flex items-center gap-1.5 text-xs text-[#374151]">
          <MdPerson size={14} className="text-[#9ca3af]" />
          {visit.customer || "—"}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-[#374151]">
          <MdPhone size={14} className="text-[#9ca3af]" />
          {visit.phone || "—"}
        </p>
      </div>

      {visit.notes && (
        <p className="mt-2 rounded-lg bg-[#faf8f5] px-3 py-2 text-xs text-[#374151]">{visit.notes}</p>
      )}

      {visit.livePhotos?.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
            Live Photos ({visit.livePhotos.length})
          </p>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {visit.livePhotos.map((photo, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={photo.url}
                alt={photo.name || "Live photo"}
                className="aspect-square w-full rounded-lg border border-[#e8e0d5] object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-1.5 border-t border-[#f0ebe3] pt-3">
        <TimelineRow icon={MdDirectionsWalk} label="Ready to Move" time={formatDateTime(visit.movingAt)} />
        <TimelineRow icon={MdCameraAlt} label="Live Photo" time={formatDateTime(visit.photoAt)} />
        <TimelineRow icon={MdCheckCircle} label="Visit Done" time={formatDateTime(visit.doneAt)} />
        <TimelineRow icon={MdSend} label="Visit Submitted" time={formatDateTime(visit.submittedAt)} />
      </div>
    </div>
  );
}

// Read-only admin view of a CP partner's real portal data — the admin-side
// equivalent of what the partner sees on their own /portal/*-cp dashboard:
// assigned/joined campaigns, ad links (Digital), site visits (Field),
// leads they've submitted, and commissions earned. Protected the same way
// every /admin/* route is — via the AdminGuard wrapping app/(admin)/admin/layout.js.
export default function PartnerPortalPage() {
  const { cpType, accountId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [adLinks, setAdLinks] = useState([]);
  const [siteVisits, setSiteVisits] = useState([]);

  useEffect(() => {
    if (!accountId) return;
    let active = true;

    Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);

      const level = LEVEL_FOR_CP_TYPE[cpType];
      const [userRes, asg, cpl, comm, links, visits] = await Promise.all([
        fetch(`/api/users/${accountId}`).then((res) => res.json()).catch(() => ({ success: false })),
        getJSON(`/api/assignments?assignedToAccountId=${accountId}${level ? `&level=${level}` : ""}`),
        getJSON(`/api/cp-leads?submittedByAccountId=${accountId}`),
        getJSON(`/api/commissions?cpAccountId=${accountId}`),
        cpType === "digital" ? getJSON(`/api/ad-links?digitalCpAccountId=${accountId}`) : Promise.resolve([]),
        cpType === "field" ? getJSON(`/api/site-visits?fieldCpAccountId=${accountId}`) : Promise.resolve([]),
      ]);

      if (!active) return;
      if (!userRes.success) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPartner(userRes.data);
      setAssignments(asg);
      setLeads(cpl);
      setCommissions(comm);
      setAdLinks(links);
      setSiteVisits(visits);
      setLoading(false);
    });

    return () => { active = false; };
  }, [cpType, accountId]);

  const backHref = `/admin/freelancer-cp/${cpType}`;

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <p className="text-[#9ca3af]">Partner not found</p>
        <button onClick={() => router.push(backHref)} className="text-sm text-[#f0b429] hover:underline">
          ← Back to {CP_TYPE_TITLES[cpType] || "CP"} Management
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push(backHref)}
        className="mb-4 flex items-center gap-1.5 text-sm text-[#9ca3af] transition hover:text-[#1a1a2e]"
      >
        <MdArrowBack size={16} /> Back to {CP_TYPE_TITLES[cpType] || "CP"} Management
      </button>

      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="h-16 animate-pulse rounded-2xl bg-[#f0ebe3]" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#f0ebe3]" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-[#e8e0d5] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-[#1a1a2e]">{partner.fullName}</h1>
                <p className="mt-1 text-sm text-[#9ca3af]">
                  {partner.accountId}
                  {partner.mobile ? ` · ${partner.mobile}` : ""}
                  {partner.city ? ` · ${partner.city}` : ""}
                </p>
              </div>
              <AdminStatusBadge status={partner.status} />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <Section
              title={cpType === "digital" ? "Assigned / Joined Campaigns" : "Assigned Projects"}
              count={assignments.length}
              icon={MdAssignmentInd}
            >
              {assignments.length === 0 ? (
                <EmptyRow message="No projects assigned to this partner yet." />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {assignments.map((a) => (
                    <div key={a.id} className="rounded-2xl border border-[#e8e0d5] bg-white p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#1a1a2e]">{a.propertyTitle || "—"}</p>
                          <p className="mt-0.5 truncate text-xs text-[#9ca3af]">{a.propertyLocation || "—"}</p>
                        </div>
                        <AdminStatusBadge
                          status={cpType === "digital" ? (a.status === "In Progress" ? "Joined" : a.status === "Completed" ? "Completed" : "Not Joined") : a.status}
                          customColors={cpType === "digital" ? { Joined: "bg-emerald-50 text-emerald-700 border-emerald-200", "Not Joined": "bg-gray-100 text-gray-500 border-gray-200", Completed: "bg-emerald-50 text-emerald-700 border-emerald-200" } : undefined}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {cpType === "digital" && (
              <Section title="Ad Links" count={adLinks.length} icon={MdLink}>
                {adLinks.length === 0 ? (
                  <EmptyRow message="No ad links added by this partner yet." />
                ) : (
                  <div className="flex flex-col gap-2">
                    {adLinks.map((link) => (
                      <div key={link.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8e0d5] bg-white p-3.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1a1a2e]">{link.platform}</p>
                          <a href={link.link} target="_blank" rel="noopener noreferrer" className="mt-0.5 block truncate text-xs text-[#2563eb] hover:underline">
                            {link.link}
                          </a>
                        </div>
                        <span className="shrink-0 text-xs text-[#9ca3af]">{link.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {cpType === "field" && (
              <Section title="Site Visits" count={siteVisits.length} icon={MdDirectionsWalk}>
                {siteVisits.length === 0 ? (
                  <EmptyRow message="No site visits logged by this partner yet." />
                ) : (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {siteVisits.map((visit) => (
                      <VisitCard key={visit.id} visit={visit} />
                    ))}
                  </div>
                )}
              </Section>
            )}

            <Section title="Leads Submitted" count={leads.length} icon={MdLeaderboard}>
              {leads.length === 0 ? (
                <EmptyRow message="No leads submitted by this partner yet." />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {leads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8e0d5] bg-white p-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1a1a2e]">{lead.customer}</p>
                        <p className="mt-0.5 text-xs text-[#9ca3af]">{lead.project || "—"} · {lead.phone || "—"}</p>
                      </div>
                      <AdminStatusBadge status={lead.status} />
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Commissions" count={commissions.length} icon={MdAttachMoney}>
              {commissions.length === 0 ? (
                <EmptyRow message="No commissions recorded for this partner yet." />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {commissions.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8e0d5] bg-white p-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1a1a2e]">{c.customer || "—"}</p>
                        <p className="mt-0.5 text-xs text-[#9ca3af]">{c.project || "—"}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-semibold text-[#d97706]">{c.amount}</span>
                        <AdminStatusBadge status={c.approvalStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </>
      )}
    </div>
  );
}
