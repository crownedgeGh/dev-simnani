"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MdArrowBack,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdInbox,
  MdLeaderboard,
  MdGroups,
  MdWorkHistory,
} from "react-icons/md";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import { getServiceTypeLabel } from "@/lib/serviceProviders";

async function getJSON(url) {
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

function initials(name) {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function Card({ title, count, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-[#e8e0d5] bg-white">
      <div className="flex items-center gap-2 border-b border-[#f0ebe3] px-5 py-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#fff8e1] text-[#d97706]">
          <Icon size={15} />
        </span>
        <h4 className="text-sm font-semibold text-[#1a1a2e]">{title}</h4>
        <span className="rounded-full bg-[#f0ebe3] px-1.5 py-0.5 text-[10px] font-medium text-[#9ca3af]">{count}</span>
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

// Read-only admin view of a contractor's own portal — mirrors what they see
// on /portal/service-provider (leads they've received, clients they're
// managing), fetched here by accountId instead of session.
export default function ContractorPortalPage() {
  const { accountId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [contractor, setContractor] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (!accountId) return;
    let active = true;

    Promise.resolve().then(async () => {
      setLoading(true);
      const [userRes, leadsData, clientsData] = await Promise.all([
        fetch(`/api/users/${accountId}`).then((res) => res.json()).catch(() => ({ success: false })),
        getJSON(`/api/leads?ownerId=${accountId}`),
        getJSON(`/api/clients?ownerId=${accountId}`),
      ]);

      if (!active) return;
      if (!userRes.success) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setContractor(userRes.data);
      setLeads(leadsData);
      setClients(clientsData);
      setLoading(false);
    });

    return () => { active = false; };
  }, [accountId]);

  const backHref = "/admin/freelancer-cp/contractor";

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <p className="text-[#9ca3af]">Contractor not found</p>
        <button onClick={() => router.push(backHref)} className="text-sm text-[#f0b429] hover:underline">
          ← Back to Contractors
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
        <MdArrowBack size={16} /> Back to Contractors
      </button>

      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="h-32 animate-pulse rounded-2xl bg-[#f0ebe3]" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[#f0ebe3]" />
            ))}
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#f0ebe3]" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6 overflow-hidden rounded-2xl border border-[#e8e0d5] bg-white">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff8e1] text-lg font-bold text-[#d97706]">
                  {initials(contractor.fullName)}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-[#1a1a2e]">{contractor.fullName}</h1>
                    <AdminStatusBadge status={contractor.status} />
                    <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                      {getServiceTypeLabel(contractor.serviceType)}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-[#9ca3af]">{contractor.accountId}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#374151] sm:flex-col sm:items-end">
                {contractor.mobile && (
                  <span className="flex items-center gap-1.5">
                    <MdPhone size={14} className="text-[#9ca3af]" /> <AdminPhoneCell value={contractor.mobile} />
                  </span>
                )}
                {contractor.email && (
                  <span className="flex items-center gap-1.5">
                    <MdEmail size={14} className="text-[#9ca3af]" /> {contractor.email}
                  </span>
                )}
                {contractor.city && (
                  <span className="flex items-center gap-1.5">
                    <MdLocationOn size={14} className="text-[#9ca3af]" /> {contractor.city}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-[#f0ebe3] bg-[#faf8f5] p-4">
              <StatChip icon={MdWorkHistory} label="Years of Experience" value={contractor.yearsOfExperience || "—"} />
              <StatChip icon={MdLeaderboard} label="Leads" value={leads.length} />
              <StatChip icon={MdGroups} label="Clients" value={clients.length} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Card title="Leads" count={leads.length} icon={MdLeaderboard}>
              {leads.length === 0 ? (
                <EmptyRow message="No leads received by this contractor yet." />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {leads.map((lead) => (
                    <div key={lead._id || lead.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] p-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1a1a2e]">{lead.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#9ca3af]">
                          {lead.interest || "—"} · <AdminPhoneCell value={lead.phone} />
                        </p>
                      </div>
                      <AdminStatusBadge status={lead.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Clients" count={clients.length} icon={MdGroups}>
              {clients.length === 0 ? (
                <EmptyRow message="No clients managed by this contractor yet." />
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {clients.map((client) => (
                    <div key={client._id || client.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] p-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1a1a2e]">{client.name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#9ca3af]">
                          {client.property || "—"} · <AdminPhoneCell value={client.phone} />
                        </p>
                      </div>
                      <AdminStatusBadge status={client.status} />
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
