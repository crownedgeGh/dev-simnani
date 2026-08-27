"use client";

import { useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import PropertyGrid from "./PropertyGrid";
import {
  getLocationCity,
  parsePriceToNumber,
  SALE_BUDGET_RANGES,
  RENT_BUDGET_RANGES,
  BHK_OPTIONS,
} from "@/lib/properties";

const filterFieldClass =
  "h-11 w-full rounded-sm border border-navy-700/60 bg-navy-950 px-3 text-sm text-cream outline-none transition focus:border-gold-400 sm:h-12";

export default function PropertyFilterBar({ properties, pricingMode = "sale", emptyMessage }) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [bhk, setBhk] = useState("");

  const hasBeds = useMemo(() => properties.some((p) => p.beds), [properties]);
  const budgetRanges = pricingMode === "rent" ? RENT_BUDGET_RANGES : SALE_BUDGET_RANGES;

  const cityOptions = useMemo(() => {
    const cities = new Set(properties.map((p) => getLocationCity(p.location)));
    return Array.from(cities).sort();
  }, [properties]);

  const selectedRange = budgetRanges.find((range) => range.label === budget);

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesSearch =
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (city && getLocationCity(property.location) !== city) return false;

      if (selectedRange) {
        const value = parsePriceToNumber(property.price);
        if (value == null) return false;
        if (selectedRange.min != null && value < selectedRange.min) return false;
        if (selectedRange.max != null && value >= selectedRange.max) return false;
      }

      if (bhk) {
        const wantsFourPlus = bhk === "4";
        if (!property.beds) return false;
        if (wantsFourPlus ? property.beds < 4 : property.beds !== Number(bhk)) return false;
      }

      return true;
    });
  }, [properties, search, city, selectedRange, bhk]);

  const activeFilters = [
    city && { key: "city", label: city, clear: () => setCity("") },
    budget && { key: "budget", label: budget, clear: () => setBudget("") },
    bhk && {
      key: "bhk",
      label: bhk === "4" ? "4+ BHK" : `${bhk} BHK`,
      clear: () => setBhk(""),
    },
  ].filter(Boolean);

  function clearAll() {
    setSearch("");
    setCity("");
    setBudget("");
    setBhk("");
  }

  return (
    <div>
      <div className="border border-navy-700/60 bg-navy-900 p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by property name or area"
              className={`${filterFieldClass} pl-9`}
            />
          </div>

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={`${filterFieldClass} appearance-none`}
            aria-label="Filter by city"
          >
            <option value="">All Cities</option>
            {cityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={`${filterFieldClass} appearance-none`}
            aria-label="Filter by budget"
          >
            <option value="">Any Budget</option>
            {budgetRanges.map((range) => (
              <option key={range.label} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>

          {hasBeds ? (
            <select
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className={`${filterFieldClass} appearance-none`}
              aria-label="Filter by BHK"
            >
              <option value="">Any BHK</option>
              {BHK_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n === 4 ? "4+ BHK" : `${n} BHK`}
                </option>
              ))}
            </select>
          ) : (
            <div className="hidden lg:block" aria-hidden="true" />
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-navy-800 pt-3">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={filter.clear}
                className="tracked-label flex items-center gap-1.5 border border-gold-500/40 bg-gold-400/10 px-3 py-1.5 text-[11px] text-gold-400 transition hover:bg-gold-400/15"
              >
                {filter.label}
                <FiX className="h-3 w-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="tracked-label px-2 py-1.5 text-[11px] text-muted underline-offset-2 transition hover:text-cream hover:underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted sm:text-sm">
        Showing {filtered.length} of {properties.length} propert
        {properties.length === 1 ? "y" : "ies"}
      </p>

      <div className="mt-4">
        <PropertyGrid properties={filtered} emptyMessage={emptyMessage} />
      </div>
    </div>
  );
}
