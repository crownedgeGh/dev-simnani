"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MdClose, MdGridView } from "react-icons/md";
import PlotGrid, { formatArea } from "@/components/shared/PlotGrid";
import { PLOT_STATUSES, PLOT_STATUS_META } from "@/lib/plotInventory";

function formatINR(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const chip = (active) =>
  `tracked-label flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-sm border px-3 text-xs transition ${
    active
      ? "border-gold-400 bg-gold-400 text-navy-950"
      : "border-navy-700/60 text-muted hover:border-gold-500 hover:text-gold-400"
  }`;

// Read-only plot board for the public /others page. `plots` arrive already
// stripped of buyer details by the server component.
export default function PlotLayoutViewer({ plots }) {
  const projects = useMemo(() => [...new Set(plots.map((p) => p.project))], [plots]);
  const [project, setProject] = useState(projects[0]);
  const [block, setBlock] = useState("");
  const [status, setStatus] = useState("");
  const [unit, setUnit] = useState("sqft");
  const [active, setActive] = useState(null);

  const projectPlots = useMemo(() => plots.filter((p) => p.project === project), [plots, project]);
  const blocks = useMemo(() => [...new Set(projectPlots.map((p) => p.block))], [projectPlots]);
  const counts = useMemo(() => {
    const c = Object.fromEntries(PLOT_STATUSES.map((s) => [s, 0]));
    for (const p of projectPlots) c[p.status] += 1;
    return c;
  }, [projectPlots]);
  const reraNo = projectPlots.find((p) => p.reraRegNo)?.reraRegNo;

  const groups = useMemo(() => {
    const map = new Map();
    for (const p of projectPlots) {
      if ((block && p.block !== block) || (status && p.status !== status)) continue;
      if (!map.has(p.block)) map.set(p.block, []);
      map.get(p.block).push(p);
    }
    return [...map].map(([b, list]) => ({ block: b, plots: list }));
  }, [projectPlots, block, status]);

  if (!plots.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border border-navy-700/60 bg-navy-900 px-4 py-16 text-center">
        <MdGridView className="h-9 w-9 text-gold-400" />
        <p className="font-display text-xl text-cream">Plot layouts coming soon</p>
        <p className="text-sm text-muted">Check back shortly for live plot availability.</p>
      </div>
    );
  }

  function switchProject(p) {
    setProject(p);
    setBlock("");
    setActive(null);
  }

  const activeMeta = active && PLOT_STATUS_META[active.status];

  return (
    <div>
      {projects.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {projects.map((p) => (
            <button key={p} onClick={() => switchProject(p)} className={chip(p === project)}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Summary — doubles as a status filter */}
      <div className="overflow-hidden rounded-sm border border-navy-700/60 bg-navy-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-700/60 px-4 py-3 sm:px-6">
          <p className="font-display text-lg text-cream sm:text-xl">
            {project} <span className="text-gold-400">· {projectPlots.length} plots</span>
          </p>
          {reraNo && <span className="tracked-label text-xs text-muted">RERA: {reraNo}</span>}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {PLOT_STATUSES.map((s) => {
            const m = PLOT_STATUS_META[s];
            const on = status === s;
            return (
              <button
                key={s}
                onClick={() => setStatus(on ? "" : s)}
                className={`flex items-center gap-3 p-3 text-left transition hover:bg-navy-800 sm:p-4 ${on ? "bg-navy-800" : ""}`}
              >
                <span
                  className="flex h-10 min-w-12 items-center justify-center rounded-sm px-2 text-sm font-bold"
                  style={{ background: `linear-gradient(180deg, ${m.top}, ${m.bottom})`, boxShadow: `0 3px 0 ${m.side}`, color: m.text }}
                >
                  {counts[s]}
                </span>
                <span className={`tracked-label text-[11px] ${on ? "text-gold-400" : "text-cream"}`}>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="my-6 flex flex-wrap items-center gap-2">
        <button onClick={() => setBlock("")} className={chip(!block)}>All</button>
        {blocks.map((b) => (
          <button key={b} onClick={() => setBlock(block === b ? "" : b)} className={chip(block === b)}>
            {b}
          </button>
        ))}
        <button onClick={() => setUnit(unit === "sqft" ? "sqyd" : "sqft")} className={`${chip(false)} sm:ml-auto`}>
          {unit === "sqft" ? "sq.ft" : "sq.yd"}
        </button>
      </div>

      {groups.length ? (
        <PlotGrid
          theme="public"
          groups={groups}
          unit={unit}
          selectMode={!!active}
          selectedIds={new Set(active ? [active._id] : [])}
          onTileClick={(p) => setActive(active?._id === p._id ? null : p)}
        />
      ) : (
        <p className="rounded-sm border border-navy-700/60 bg-navy-900 py-16 text-center text-sm text-muted">
          No plots match this filter.
        </p>
      )}

      {/* Selected plot details */}
      {active && (
        <div className="mt-6 rounded-sm border border-gold-500/40 bg-navy-900 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="tracked-label text-xs text-muted">Block {active.block}</span>
              <p className="font-display text-3xl text-cream">Plot {active.plotNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="tracked-label rounded-sm px-2.5 py-1 text-[11px]" style={{ background: activeMeta.bottom, color: activeMeta.text }}>
                {activeMeta.label}
              </span>
              <button
                onClick={() => setActive(null)}
                aria-label="Close plot details"
                className="flex h-11 w-11 items-center justify-center text-muted transition hover:text-gold-400"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Detail label="Area" value={active.areaSqft ? `${formatArea(active.areaSqft, "sqft")} · ${formatArea(active.areaSqft, "sqyd")}` : "—"} />
            <Detail label="Dimensions" value={active.lengthFt && active.widthFt ? `${active.lengthFt} × ${active.widthFt} ft` : "—"} />
            <Detail label="Facing" value={[active.facing, active.isCorner && "Corner"].filter(Boolean).join(" · ") || "—"} />
            <Detail
              label="Price"
              value={active.totalPrice ? formatINR(active.totalPrice) : active.status === "available" ? "On request" : "—"}
              sub={active.ratePerSqft ? `₹${active.ratePerSqft.toLocaleString("en-IN")} / sq.ft` : ""}
              gold
            />
          </dl>

          {active.status === "available" && (
            <Link
              href="/request-callback"
              className="tracked-label mt-6 inline-flex h-11 items-center bg-gold-400 px-5 text-xs text-navy-950 transition hover:bg-gold-300"
            >
              Enquire about {active.plotNumber}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, sub, gold }) {
  return (
    <div>
      <dt className="tracked-label text-[11px] text-muted">{label}</dt>
      <dd className={`mt-1 ${gold ? "font-display text-xl text-gold-400" : "text-sm text-cream"}`}>{value}</dd>
      {sub && <dd className="text-xs text-muted">{sub}</dd>}
    </div>
  );
}
