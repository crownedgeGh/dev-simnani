"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MdArrowBack,
  MdPerson,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdDirectionsWalk,
  MdCameraAlt,
  MdCheckCircle,
  MdSend,
  MdInbox,
  MdAssignmentInd,
  MdLeaderboard,
  MdLink,
  MdAttachMoney,
  MdOpenInNew,
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

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// A single card container used for every section so the whole detail page
// reads as one consistent system, instead of each section styling itself.
function Card({ title, count, icon: Icon, actions, children }) {
  return (
    <div className="rounded-2xl border border-[#e8e0d5] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#f0ebe3] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fff8e1] text-[#d97706]">
            <Icon size={15} />
          </span>
          <h4 className="text-sm font-semibold text-[#1a1a2e]">{title}</h4>
          <span className="rounded-full bg-[#f0ebe3] px-1.5 py-0.5 text-[10px] font-medium text-[#9ca3af]">{count}</span>
        </div>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyRow({ message }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#e8e0d5] py-8">
      <MdInbox size={22} className="text-[#c9c3bc]" />
      <p className="text-xs text-[#9ca3af]">{message}</p>
    </div>
  );
}

function StatChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-3.5 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#d97706]">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold leading-tight text-[#1a1a2e]">{value}</p>
        <p className="truncate text-[10px] uppercase tracking-wide text-[#9ca3af]">{label}</p>
      </div>
    </div>
  );
}

// Horizontal step tracker — the read-only admin mirror of the interactive
// timeline the Field CP sees on their own /portal/field-cp dashboard
// (VisitTimelineStep/Connector in components/portal/FieldCPDashboard.jsx),
// so admin and partner see the exact same visual language for a visit.
function StepTracker({ steps }) {
  return (
    <div className="flex items-start">
      {steps.map((step, i) => (
        <div key={step.label} className="flex flex-1 items-start last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                step.done
                  ? "border-[#f0b429] bg-[#f0b429] text-white"
                  : "border-[#e8e0d5] bg-white text-[#c9c3bc]"
              }`}
            >
              <step.icon size={16} />
            </span>
            <span className={`w-20 text-center text-[10px] font-medium leading-tight ${step.done ? "text-[#1a1a2e]" : "text-[#9ca3af]"}`}>
              {step.label}
            </span>
            <span className="w-20 text-center text-[9px] leading-tight text-[#9ca3af]">{step.time || "—"}</span>
          </div>
          {i < steps.length - 1 && (
            <span className={`mt-4 h-0.5 flex-1 shrink transition ${step.done && steps[i + 1].done ? "bg-[#f0b429]" : "bg-[#e8e0d5]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function VisitCard({ visit }) {
  const readyDone = Boolean(visit.movingAt);
  const photoDone = (visit.livePhotos?.length || 0) > 0;
  const doneDone = Boolean(visit.doneAt);
  const submittedDone = Boolean(visit.submittedAt);

  const steps = [
    { label: "Ready to Move", icon: MdDirectionsWalk, done: readyDone, time: formatDateTime(visit.movingAt) },
    { label: photoDone ? `Live Photo (${visit.livePhotos.length})` : "Live Photo", icon: MdCameraAlt, done: photoDone, time: formatDateTime(visit.photoAt) },
    { label: "Visit Done", icon: MdCheckCircle, done: doneDone, time: formatDateTime(visit.doneAt) },
    { label: "Visit Submitted", icon: MdSend, done: submittedDone, time: formatDateTime(visit.submittedAt) },
  ];

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

      <div className="mt-4 overflow-x-auto border-t border-[#f0ebe3] pt-4">
        <div className="min-w-[360px]">
          <StepTracker steps={steps} />
        </div>
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

  const totalCommission = commissions.reduce((sum, c) => {
    const n = parseFloat(String(c.amount || "0").replace(/[^0-9.]/g, ""));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

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
          <div className="h-32 animate-pulse rounded-2xl bg-[#f0ebe3]" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[#f0ebe3]" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#f0ebe3]" />
          ))}
        </div>
      ) : (
        <>
          {/* Profile header */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-[#e8e0d5] bg-white">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff8e1] text-lg font-bold text-[#d97706]">
                  {initials(partner.fullName)}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-[#1a1a2e]">{partner.fullName}</h1>
                    <AdminStatusBadge status={partner.status} />
                    <AdminStatusBadge status={cpType} customColors={{ [cpType]: "bg-[#fff8e1] text-[#d97706] border-[#f0b429]/30" }} className="capitalize" />
                  </div>
                  <p className="mt-1 font-mono text-xs text-[#9ca3af]">{partner.accountId}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#374151] sm:flex-col sm:items-end">
                {partner.mobile && (
                  <span className="flex items-center gap-1.5">
                    <MdPhone size={14} className="text-[#9ca3af]" /> {partner.mobile}
                  </span>
                )}
                {partner.email && (
                  <span className="flex items-center gap-1.5">
                    <MdEmail size={14} className="text-[#9ca3af]" /> {partner.email}
                  </span>
                )}
                {partner.city && (
                  <span className="flex items-center gap-1.5">
                    <MdLocationOn size={14} className="text-[#9ca3af]" /> {partner.city}
                  </span>
                )}
              </div>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-2 gap-3 border-t border-[#f0ebe3] bg-[#faf8f5] p-4 sm:grid-cols-4">
              <StatChip icon={MdAssignmentInd} label="Assigned Projects" value={assignments.length} />
              {cpType === "digital" && <StatChip icon={MdLink} label="Ad Links" value={adLinks.length} />}
              {cpType === "field" && <StatChip icon={MdDirectionsWalk} label="Site Visits" value={siteVisits.length} />}
              <StatChip icon={MdLeaderboard} label="Leads Submitted" value={leads.length} />
              <StatChip icon={MdAttachMoney} label="Commissions" value={commissions.length} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Card
              title={cpType === "digital" ? "Assigned / Joined Campaigns" : "Assigned Projects"}
              count={assignments.length}
              icon={MdAssignmentInd}
            >
              {assignments.length === 0 ? (
                <EmptyRow message="No projects assigned to this partner yet." />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {assignments.map((a) => (
                    <div key={a.id} className="rounded-xl border border-[#e8e0d5] bg-[#faf8f5] p-3.5">
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
            </Card>

            {cpType === "digital" && (
              <Card title="Ad Links" count={adLinks.length} icon={MdLink}>
                {adLinks.length === 0 ? (
                  <EmptyRow message="No ad links added by this partner yet." />
                ) : (
                  <div className="flex flex-col gap-2">
                    {adLinks.map((link) => (
                      <div key={link.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] p-3.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1a1a2e]">{link.platform}</p>
                          <a href={link.link} target="_blank" rel="noopener noreferrer" className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#2563eb] hover:underline">
                            {link.link} <MdOpenInNew size={11} className="shrink-0" />
                          </a>
                        </div>
                        <span className="shrink-0 text-xs text-[#9ca3af]">{link.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {cpType === "field" && (
              <Card title="Site Visits" count={siteVisits.length} icon={MdDirectionsWalk}>
                {siteVisits.length === 0 ? (
                  <EmptyRow message="No site visits logged by this partner yet." />
                ) : (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {siteVisits.map((visit) => (
                      <VisitCard key={visit.id} visit={visit} />
                    ))}
                  </div>
                )}
              </Card>
            )}

            <Card title="Leads Submitted" count={leads.length} icon={MdLeaderboard}>
              {leads.length === 0 ? (
                <EmptyRow message="No leads submitted by this partner yet." />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {leads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] p-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1a1a2e]">{lead.customer}</p>
                        <p className="mt-0.5 text-xs text-[#9ca3af]">{lead.project || "—"} · {lead.phone || "—"}</p>
                      </div>
                      <AdminStatusBadge status={lead.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              title="Commissions"
              count={commissions.length}
              icon={MdAttachMoney}
              actions={
                commissions.length > 0 && (
                  <span className="text-xs font-semibold text-[#d97706]">
                    ₹{totalCommission.toLocaleString("en-IN")} total
                  </span>
                )
              }
            >
              {commissions.length === 0 ? (
                <EmptyRow message="No commissions recorded for this partner yet." />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {commissions.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] p-3.5">
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
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
