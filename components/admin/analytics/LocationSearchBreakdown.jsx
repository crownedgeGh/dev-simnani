"use client";

import { useMemo, useState } from "react";
import { MdKeyboardArrowDown, MdLocationCity, MdSearch } from "react-icons/md";
import { adminInputClass } from "@/components/admin/ui/AdminFormField";

// One state block: header shows the state + its total searches, click to
// expand its cities. Each city lists what was actually searched there.
function StateBlock({ state, total, cities, defaultOpen }) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8e0d5]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[44px] w-full items-center justify-between gap-3 bg-[#faf8f5] px-4 py-3 text-left transition hover:bg-[#f5f2ec]"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#1a1a2e]">
          <MdLocationCity size={16} className="text-[#f0b429]" />
          {state}
          <span className="text-xs font-normal text-[#9ca3af]">
            · {cities.length} {cities.length === 1 ? "city" : "cities"}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#d97706]">{total.toLocaleString()} searches</span>
          <MdKeyboardArrowDown
            size={18}
            className={`text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="flex flex-col divide-y divide-[#f5f2ec] border-t border-[#e8e0d5]">
          {cities.map((city) => (
            <CityRow key={city.city} city={city} />
          ))}
        </div>
      )}
    </div>
  );
}

function CityRow({ city }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[32px] w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-sm text-[#1a1a2e]">{city.city}</span>
        <span className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#9ca3af]">{city.total.toLocaleString()} searches</span>
          <MdKeyboardArrowDown
            size={16}
            className={`text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {city.terms.map((t, i) => (
            <span
              key={`${t.term}-${i}`}
              className="rounded-full border border-[#e8e0d5] bg-[#faf8f5] px-2.5 py-1 text-xs text-[#374151]"
              title={`${t.count} searches`}
            >
              {t.term}
              <span className="ml-1.5 font-semibold text-[#d97706]">{t.count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LocationSearchBreakdown({ breakdown }) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    if (!breakdown) return [];
    const q = query.trim().toLowerCase();
    const cities = q
      ? breakdown.cities.filter(
          (c) => c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
        )
      : breakdown.cities;

    const byState = new Map();
    for (const c of cities) {
      if (!byState.has(c.state)) byState.set(c.state, { state: c.state, total: 0, cities: [] });
      const entry = byState.get(c.state);
      entry.total += c.total;
      entry.cities.push(c);
    }
    return [...byState.values()].sort((a, b) => b.total - a.total);
  }, [breakdown, query]);

  if (!breakdown || breakdown.cities.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-[#9ca3af]">
        No searches recorded yet — try searching on the site, then check the Right Now panel above first.
      </p>
    );
  }

  return (
    <div>
      <div className="relative">
        <MdSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by state or city…"
          className={`${adminInputClass} pl-9`}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {grouped.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#9ca3af]">No state or city matches &quot;{query}&quot;.</p>
        ) : (
          grouped.map((s, i) => (
            <StateBlock key={s.state} state={s.state} total={s.total} cities={s.cities} defaultOpen={i === 0} />
          ))
        )}
      </div>

      {breakdown.unmatchedTotal > 0 && (
        <p className="mt-3 text-xs text-[#9ca3af]">
          {breakdown.unmatchedTotal.toLocaleString()} searches didn&apos;t mention a recognizable city and aren&apos;t shown above.
        </p>
      )}
    </div>
  );
}
