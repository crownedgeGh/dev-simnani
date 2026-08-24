"use client";

import { useState } from "react";
import Link from "next/link";
import Tabs from "./Tabs";
import Badge from "./Badge";
import EmptyState from "./EmptyState";

const TABS = [
  { key: "upcoming", label: "Upcoming Visits" },
  { key: "completed", label: "Completed Visits" },
  { key: "cancelled", label: "Cancelled Visits" },
];

const STATUS_TONE = {
  upcoming: "gold",
  completed: "success",
  cancelled: "error",
};

export default function SiteVisitsList({ visits }) {
  const [tab, setTab] = useState("upcoming");
  const filtered = visits.filter((visit) => visit.status === tab);

  return (
    <div className="flex flex-col gap-6">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState
          title="No visits here yet"
          message="Scheduled property visits in this category will appear here."
          actionHref="/buy"
          actionLabel="Explore Properties"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((visit) => (
            <div
              key={visit.id}
              className="flex flex-col gap-3 border border-navy-700/60 bg-navy-900 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-display text-base text-cream">{visit.property.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {visit.date} · {visit.time}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={STATUS_TONE[visit.status]}>{visit.status}</Badge>
                <Link
                  href={`/property/${visit.property.id}`}
                  className="tracked-label text-xs text-gold-400 hover:text-gold-300"
                >
                  View Property
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
