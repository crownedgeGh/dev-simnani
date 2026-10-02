"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiX, FiMapPin, FiSliders } from "react-icons/fi";
import ProjectGrid from "./ProjectGrid";
import {
  getLocationCity,
  getLocationCityState,
  getCityStateLabel,
  parsePriceToNumber,
  SALE_BUDGET_RANGES,
} from "@/lib/properties";
import { searchIndianCities } from "@/lib/indianCities";

const filterFieldClass =
  "h-11 w-full rounded-sm border border-navy-700/60 bg-navy-950 px-3 text-sm text-cream outline-none transition focus:border-gold-400 sm:h-12";

export default function ProjectFilterBar({ projects, emptyMessage }) {
  const cityOptions = useMemo(() => {
    const byCity = new Map();
    projects.forEach((p) => {
      const cityValue = getLocationCity(p.location);
      if (cityValue && !byCity.has(cityValue)) {
        byCity.set(cityValue, getLocationCityState(p.location));
      }
    });
    return Array.from(byCity, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [projects]);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [budget, setBudget] = useState("");
  const cityFieldRef = useRef(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  const quickCitySuggestions = useMemo(
    () => cityOptions.map((option) => ({ city: option.value, label: option.label })),
    [cityOptions]
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (cityFieldRef.current && !cityFieldRef.current.contains(event.target)) {
        setShowCitySuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCityInputChange(event) {
    const value = event.target.value;
    setCityInput(value);
    setShowCitySuggestions(true);
    if (!value.trim()) {
      setCity("");
      setCitySuggestions(quickCitySuggestions);
      return;
    }
    setCitySuggestions(
      searchIndianCities(value, 8).map((entry) => ({ city: entry.city, label: entry.label }))
    );
  }

  function handleCityFocus() {
    setCitySuggestions(
      cityInput.trim() ? searchIndianCities(cityInput, 8).map((entry) => ({ city: entry.city, label: entry.label })) : quickCitySuggestions
    );
    setShowCitySuggestions(true);
  }

  function handleCitySelect(entry) {
    setCity(entry.city);
    setCityInput(entry.label);
    setCitySuggestions([]);
    setShowCitySuggestions(false);
  }

  function clearCity() {
    setCity("");
    setCityInput("");
    setCitySuggestions([]);
  }

  const selectedRange = SALE_BUDGET_RANGES.find((range) => range.label === budget);

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      if (search) {
        const query = search.toLowerCase();
        const matchesSearch =
          project.name.toLowerCase().includes(query) ||
          project.location.toLowerCase().includes(query) ||
          project.developer.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (city && getLocationCity(project.location) !== city) return false;

      if (selectedRange) {
        const value = parsePriceToNumber(project.startingPrice);
        if (value == null) return false;
        if (selectedRange.min != null && value < selectedRange.min) return false;
        if (selectedRange.max != null && value >= selectedRange.max) return false;
      }

      return true;
    });
  }, [projects, search, city, selectedRange]);

  const activeFilters = [
    city && {
      key: "city",
      label: cityInput || getCityStateLabel(city),
      clear: clearCity,
    },
    budget && { key: "budget", label: budget, clear: () => setBudget("") },
  ].filter(Boolean);

  function clearAll() {
    setSearch("");
    clearCity();
    setBudget("");
  }

  return (
    <div>
      <div className="border border-navy-700/60 bg-navy-900 p-3 sm:p-4">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex h-12 w-full items-center justify-between gap-2 rounded-sm border border-navy-700/60 bg-navy-950 px-4 text-sm text-cream transition hover:border-gold-400 sm:hidden"
        >
          <span className="flex items-center gap-2">
            <FiSliders className="h-4 w-4 text-gold-400" />
            Filters
          </span>
          {activeFilters.length > 0 && (
            <span className="tracked-label rounded-full bg-gold-400 px-2 py-0.5 text-[10px] text-navy-950">
              {activeFilters.length}
            </span>
          )}
        </button>

        {mobileFiltersOpen && (
          <div
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
            className="sm:hidden"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(2,3,6,0.72)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />
        )}

        <div
          role={mobileFiltersOpen ? "dialog" : undefined}
          aria-modal={mobileFiltersOpen ? "true" : undefined}
          aria-label="Filters"
          className={`${
            mobileFiltersOpen
              ? "fixed inset-y-0 right-0 z-[61] flex w-[85%] max-w-sm flex-col gap-4 overflow-y-auto border-l border-gold-400/15 bg-navy-900 p-4 shadow-2xl"
              : "hidden"
          } sm:static sm:z-auto sm:w-auto sm:max-w-none sm:overflow-visible sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-[2fr_1.3fr_1fr]`}
        >
          <div className="flex items-center justify-between sm:hidden">
            <span className="font-display text-lg text-cream">Filters</span>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Close filters"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-700/60 text-cream transition hover:border-gold-400 hover:text-gold-400"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="relative w-full sm:col-span-2 lg:col-span-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name or developer"
              className={`${filterFieldClass} pl-9`}
            />
          </div>

          <div ref={cityFieldRef} className="relative w-full">
            <FiMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={cityInput}
              onChange={handleCityInputChange}
              onFocus={handleCityFocus}
              placeholder="Search city or state"
              autoComplete="off"
              role="combobox"
              aria-expanded={showCitySuggestions}
              aria-controls="project-filter-city-suggestions"
              aria-autocomplete="list"
              aria-label="Filter by city"
              className={`${filterFieldClass} pl-9 ${cityInput ? "pr-9" : ""}`}
            />
            {cityInput && (
              <button
                type="button"
                onClick={clearCity}
                aria-label="Clear city"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full text-muted transition active:scale-[0.98] hover:text-cream"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}

            {showCitySuggestions && citySuggestions.length > 0 && (
              <ul
                id="project-filter-city-suggestions"
                className="gold-scrollbar absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-sm border border-navy-700/70 bg-navy-900 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9)]"
              >
                {citySuggestions.map((entry) => (
                  <li key={entry.city}>
                    <button
                      type="button"
                      onClick={() => handleCitySelect(entry)}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-cream transition hover:bg-navy-800"
                    >
                      <FiMapPin className="h-3.5 w-3.5 shrink-0 text-gold-400" />
                      <span>{entry.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={`${filterFieldClass} appearance-none`}
            aria-label="Filter by starting price"
          >
            <option value="">Any Budget</option>
            {SALE_BUDGET_RANGES.map((range) => (
              <option key={range.label} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>

          <div className="mt-auto flex gap-2 pt-2 sm:hidden">
            <button
              type="button"
              onClick={clearAll}
              className="tracked-label flex-1 rounded-sm border border-navy-700/60 px-4 py-3 text-xs text-muted transition hover:text-cream"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="tracked-label flex-1 rounded-sm bg-gold-400 px-4 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
            >
              Show {filtered.length}
            </button>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-navy-800 pt-3">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={filter.clear}
                className="tracked-label flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-400/10 px-3.5 py-1.5 text-[11px] text-gold-400 transition active:scale-[0.98] hover:bg-gold-400/15"
              >
                {filter.label}
                <FiX className="h-3 w-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="tracked-label rounded-full px-2 py-1.5 text-[11px] text-muted underline-offset-2 transition active:scale-[0.98] hover:text-cream hover:underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted sm:text-sm">
        Showing {filtered.length} of {projects.length} development
        {projects.length === 1 ? "" : "s"}
      </p>

      <div className="mt-4">
        <ProjectGrid projects={filtered} emptyMessage={emptyMessage} />
      </div>
    </div>
  );
}
