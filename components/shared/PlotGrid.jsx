"use client";

import { MdCheck } from "react-icons/md";
import { PLOT_STATUS_META, SQFT_PER_SQYD } from "@/lib/plotInventory";

export function formatArea(sqft, unit) {
  if (!sqft) return "";
  return unit === "sqyd" ? `${Math.round((sqft / SQFT_PER_SQYD) * 10) / 10} yd²` : `${Math.round(sqft)} ft²`;
}

// Admin uses the light admin palette; the public /others page uses the site's
// navy/gold tokens.
const THEMES = {
  admin: {
    board: "border-[#e8e0d5] bg-[#f4efe4]",
    title: "text-[#1a1a2e]",
    meta: "text-[#9ca3af]",
    road: "bg-[#4b5563]",
    ring: "ring-[#1a1a2e] ring-offset-[#f4efe4]",
    check: "bg-[#1a1a2e] text-white",
  },
  public: {
    board: "border-navy-700/60 bg-navy-900",
    title: "font-display text-cream",
    meta: "text-muted",
    road: "bg-navy-700",
    ring: "ring-gold-400 ring-offset-navy-900",
    check: "bg-gold-400 text-navy-950",
  },
};

// Site-plan style board: each block is a row of raised plot tiles,
// separated by a road strip.
export default function PlotGrid({ groups, unit, selectMode, selectedIds, onTileClick, theme = "admin" }) {
  const t = THEMES[theme];
  return (
    <div className={`rounded-2xl border p-3 sm:p-5 ${t.board}`}>
      <div>
        {groups.map(({ block, plots }, gi) => (
          <div key={block}>
            {gi > 0 && <Road className={t.road} />}
            <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className={`text-sm font-bold ${t.title}`}>Block {block}</span>
              <span className={`text-[11px] ${t.meta}`}>
                {plots.length} plots · {plots.filter((p) => p.status === "available").length} available
              </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-x-2 gap-y-3 sm:grid-cols-[repeat(auto-fill,minmax(76px,1fr))]">
              {plots.map((plot) => (
                <PlotTile
                  key={plot._id}
                  plot={plot}
                  unit={unit}
                  theme={t}
                  selected={selectMode && selectedIds.has(plot._id)}
                  onClick={() => onTileClick(plot)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Road({ className }) {
  return (
    <div className={`my-4 flex h-6 items-center rounded-sm px-2 shadow-inner ${className}`} aria-hidden>
      <div className="w-full border-t-2 border-dashed border-white/50" />
    </div>
  );
}

function PlotTile({ plot, unit, theme, selected, onClick }) {
  const s = PLOT_STATUS_META[plot.status] || PLOT_STATUS_META.available;
  const title = [
    plot.plotNumber,
    s.label,
    formatArea(plot.areaSqft, unit),
    plot.facing && `${plot.facing} facing`,
    plot.isCorner && "Corner",
    plot.buyerName && `Buyer: ${plot.buyerName}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`relative flex min-h-11 flex-col items-center justify-center rounded-md px-1 py-1.5 transition duration-150 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0.5 ${
        selected ? `ring-2 ring-offset-2 ${theme.ring}` : ""
      }`}
      style={{
        background: `linear-gradient(180deg, ${s.top} 0%, ${s.bottom} 100%)`,
        boxShadow: `0 4px 0 ${s.side}, 0 7px 10px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.45)`,
        color: s.text,
      }}
    >
      {plot.isCorner && (
        <span
          className="absolute left-0 top-0 h-0 w-0 rounded-tl-md border-r-[10px] border-t-[10px] border-r-transparent"
          style={{ borderTopColor: "rgba(255,255,255,0.85)" }}
          aria-label="Corner plot"
        />
      )}
      {selected && (
        <span className={`absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full ${theme.check}`}>
          <MdCheck size={12} />
        </span>
      )}
      <span className="text-[11px] font-bold leading-tight sm:text-xs">{plot.plotNumber}</span>
      {plot.areaSqft > 0 && <span className="text-[9px] leading-tight opacity-80">{formatArea(plot.areaSqft, unit)}</span>}
    </button>
  );
}
