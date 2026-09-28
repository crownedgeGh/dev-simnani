"use client";

import { useEffect, useState } from "react";
import {
  MdPerson,
  MdPhone,
  MdDirectionsWalk,
  MdCameraAlt,
  MdCheckCircle,
  MdSend,
  MdInbox,
} from "react-icons/md";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";

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

export default function FieldPartnerVisitsDialog({ isOpen, onClose, partner }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !partner?.accountId) return;
    let active = true;
    fetch(`/api/site-visits?fieldCpAccountId=${partner.accountId}`)
      .then((res) => res.json())
      .then((json) => {
        if (active) setVisits(json.success ? json.data : []);
      })
      .catch(() => {
        if (active) setVisits([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [isOpen, partner]);

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={partner?.name || "Field CP Partner"}
      description={`${partner?.accountId || ""}${partner?.phone ? ` · ${partner.phone}` : ""}`}
      size="xl"
    >
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-[#f0ebe3]" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf8f5]">
            <MdInbox size={24} className="text-[#9ca3af]" />
          </div>
          <p className="text-sm font-medium text-[#374151]">No site visits logged by this partner yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visits.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))}
        </div>
      )}
    </AdminDialog>
  );
}
