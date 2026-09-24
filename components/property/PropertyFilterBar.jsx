"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiSearch, FiX, FiMapPin } from "react-icons/fi";
import PropertyGrid from "./PropertyGrid";
import {
  getLocationCity,
  getLocationCityState,
  getCityStateLabel,
  getPropertyCategoryLabels,
  parsePriceToNumber,
  SALE_BUDGET_RANGES,
  RENT_BUDGET_RANGES,
  BHK_OPTIONS,
  RESIDENTIAL_TYPE_OPTIONS,
} from "@/lib/properties";
import { searchIndianCities } from "@/lib/indianCities";
import { trackEvent } from "@/lib/gtag";

// Accepts either a plain dropdown value ("1".."5") or a free-form label
// like "4 BHK+" (as sent by the homepage search bar) and normalizes it to
// a { num, plus } match rule. "5" is treated as "5+" to match the existing
// dropdown's "5 BHK+" option.
function parseBhkValue(raw) {
  if (!raw) return null;
  const str = String(raw);
  const match = str.match(/(\d+)/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  const plus = str.includes("+") || num >= 5;
  return { num, plus };
}

const filterFieldClass =
  "h-11 w-full rounded-sm border border-navy-700/60 bg-navy-950 px-3 text-sm text-cream outline-none transition focus:border-gold-400 sm:h-12";

export default function PropertyFilterBar({
  properties,
  pricingMode = "sale",
  emptyMessage,
  emphasizeDetails,
  showPropertyType = true,
}) {
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  const cityOptions = useMemo(() => {
    const byCity = new Map();
    properties.forEach((p) => {
      const cityValue = getLocationCity(p.location);
      if (cityValue && !byCity.has(cityValue)) {
        byCity.set(cityValue, getLocationCityState(p.location));
      }
    });
    return Array.from(byCity, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [properties]);

  const propertyTypeOptions = useMemo(() => {
    if (!showPropertyType) return [];
    const dataTypes = properties
      .map((p) => getPropertyCategoryLabels(p).categoryLabel)
      .filter(Boolean);
    // Union the homepage search bar's canonical type list with whatever
    // types actually appear in this page's data, so every known type is
    // always selectable — not just the ones with a listing right now.
    const types = new Set([...RESIDENTIAL_TYPE_OPTIONS, ...dataTypes]);
    const extras = Array.from(types)
      .filter((t) => !RESIDENTIAL_TYPE_OPTIONS.includes(t))
      .sort();
    return [...RESIDENTIAL_TYPE_OPTIONS, ...extras];
  }, [properties, showPropertyType]);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");
  const [bhk, setBhk] = useState("");
  const cityFieldRef = useRef(null);

  // Cities that actually have listings on this page — shown as quick picks
  // when the search box is focused but empty, before the user types anything.
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
    // Search the full India cities/states dataset, not just cities that
    // happen to have listings, so this is a real city search.
    setCitySuggestions(
      searchIndianCities(value, 8).map((entry) => ({ city: entry.city, label: entry.label }))
    );
  }

  function handleCityFocus() {
    setCitySuggestions(cityInput.trim() ? searchIndianCities(cityInput, 8).map((entry) => ({ city: entry.city, label: entry.label })) : quickCitySuggestions);
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

  // Sync filters from the URL (e.g. the homepage search bar's location/type/bhk
  // params) whenever the query string changes, not just on first mount, so
  // client-side navigations from an already-mounted filter bar also apply.
  // Adjusted during render (React's recommended pattern for syncing state to
  // a changing key) rather than in an effect, to avoid an extra render pass.
  const [syncedParamsKey, setSyncedParamsKey] = useState(null);
  if (searchParamsKey !== syncedParamsKey) {
    setSyncedParamsKey(searchParamsKey);

    const locationParam = searchParams.get("location");
    const typeParam = searchParams.get("type");
    const bhkParam = searchParams.get("bhk");

    const requestedCity = locationParam ? getLocationCity(locationParam) : "";
    setCity(requestedCity);
    setCityInput(requestedCity ? getCityStateLabel(requestedCity) : "");
    setPropertyType(typeParam || "");
    setBhk(bhkParam || "");
  }

  const hasBeds = useMemo(() => properties.some((p) => p.beds), [properties]);
  const budgetRanges = pricingMode === "rent" ? RENT_BUDGET_RANGES : SALE_BUDGET_RANGES;

  const selectedRange = budgetRanges.find((range) => range.label === budget);
  const bhkFilter = parseBhkValue(bhk);
  // Reflect the parsed filter in the dropdown when it maps cleanly onto one
  // of the fixed BHK_OPTIONS (e.g. URL "2 BHK" -> option "2"). A "+" filter
  // below the top tier (e.g. "4 BHK+") has no exact matching option, so the
  // dropdown is left on "Any BHK" rather than mislabeling it.
  const bhkSelectValue = bhkFilter
    ? bhkFilter.plus
      ? "5"
      : BHK_OPTIONS.includes(bhkFilter.num)
        ? String(bhkFilter.num)
        : ""
    : "";

  // Debounce so one combined, human-readable query (e.g. "2 BHK • Rent •
  // Pune • Under 50L") fires per pause in filtering, not a fragment per field.
  useEffect(() => {
    if (!search.trim() && !city && !propertyType && !budget && !bhk) return;
    const timer = setTimeout(() => {
      const parts = [];
      if (bhk) parts.push(bhkFilter ? `${bhkFilter.num}${bhkFilter.plus ? "+" : ""} BHK` : bhk);
      if (propertyType) parts.push(propertyType);
      if (search.trim()) parts.push(`"${search.trim()}"`);
      parts.push(pricingMode === "rent" ? "Rent" : "Sale");
      if (city) parts.push(city);
      if (budget) parts.push(budget);

      trackEvent("search", {
        search_term: parts.join(" • "),
        pricing_mode: pricingMode,
        city: city || undefined,
        property_type: propertyType || undefined,
        budget: budget || undefined,
        bhk: bhk || undefined,
        free_text: search.trim() || undefined,
      });
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, city, propertyType, budget, bhk]);

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

      if (propertyType && getPropertyCategoryLabels(property).categoryLabel !== propertyType) {
        return false;
      }

      if (selectedRange) {
        const value = parsePriceToNumber(property.price);
        if (value == null) return false;
        if (selectedRange.min != null && value < selectedRange.min) return false;
        if (selectedRange.max != null && value >= selectedRange.max) return false;
      }

      if (bhkFilter) {
        if (!property.beds) return false;
        if (bhkFilter.plus ? property.beds < bhkFilter.num : property.beds !== bhkFilter.num) {
          return false;
        }
      }

      return true;
    });
  }, [properties, search, city, propertyType, selectedRange, bhkFilter]);

  const activeFilters = [
    city && {
      key: "city",
      label: cityInput || getCityStateLabel(city),
      clear: clearCity,
    },
    showPropertyType &&
      propertyType && { key: "propertyType", label: propertyType, clear: () => setPropertyType("") },
    budget && { key: "budget", label: budget, clear: () => setBudget("") },
    bhkFilter && {
      key: "bhk",
      label: `${bhkFilter.num}${bhkFilter.plus ? "+" : ""} BHK`,
      clear: () => setBhk(""),
    },
  ].filter(Boolean);

  function clearAll() {
    setSearch("");
    clearCity();
    setPropertyType("");
    setBudget("");
    setBhk("");
  }

  return (
    <div>
      <div className="border border-navy-700/60 bg-navy-900 p-3 sm:p-4">
        <div
          className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
            showPropertyType
              ? "lg:grid-cols-[2fr_1fr_1.3fr_1fr_1fr]"
              : "lg:grid-cols-[2fr_1.3fr_1fr_1fr]"
          }`}
        >
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

          {showPropertyType && (
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={`${filterFieldClass} appearance-none`}
              aria-label="Filter by property type"
            >
              <option value="">All Types</option>
              {propertyTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          <div ref={cityFieldRef} className="relative">
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
              aria-controls="filter-city-suggestions"
              aria-autocomplete="list"
              aria-label="Filter by city"
              className={`${filterFieldClass} pl-9 ${cityInput ? "pr-9" : ""}`}
            />
            {cityInput && (
              <button
                type="button"
                onClick={clearCity}
                aria-label="Clear city"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-cream"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}

            {showCitySuggestions && citySuggestions.length > 0 && (
              <ul
                id="filter-city-suggestions"
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
              value={bhkSelectValue}
              onChange={(e) => setBhk(e.target.value)}
              className={`${filterFieldClass} appearance-none`}
              aria-label="Filter by BHK"
            >
              <option value="">Any BHK</option>
              {BHK_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n === 5 ? "5+ BHK" : `${n} BHK`}
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
        <PropertyGrid properties={filtered} emptyMessage={emptyMessage} emphasizeDetails={emphasizeDetails} />
      </div>
    </div>
  );
}
