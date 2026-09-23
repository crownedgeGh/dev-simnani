"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MdLocationOn, MdSearch } from "react-icons/md";
import { FiChevronDown } from "react-icons/fi";
import { INVEST_CATEGORIES } from "@/lib/properties";
import { searchIndianCities } from "@/lib/indianCities";
import { trackEvent } from "@/lib/gtag";

const MODES = [
  { label: "Buy", slug: "buy" },
  { label: "Rent", slug: "rent" },
  { label: "Invest", slug: "invest" },
];

const PLACEHOLDER = "Property Type";

const SIMPLE_TYPES = ["Flat", "House", "Shop", "Plot", "Office", "Warehouse"].map(
  (label) => ({ key: label, label })
);

const PROPERTY_TYPE_OPTIONS = {
  buy: SIMPLE_TYPES,
  rent: SIMPLE_TYPES,
  invest: [
    ...INVEST_CATEGORIES,
    { key: "company-project", label: "Company Projects", href: "/projects" },
  ],
};

const SELECT_CLASS =
  "w-full appearance-none rounded-md border border-navy-700/70 bg-navy-900/80 px-4 py-3.5 text-sm text-cream transition focus:border-gold-500 focus:outline-none";

export default function SearchBar() {
  const router = useRouter();
  const [mode, setMode] = useState(MODES[0].slug);
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState(PLACEHOLDER);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationFieldRef = useRef(null);

  const typeOptions = PROPERTY_TYPE_OPTIONS[mode] ?? [];
  const hasCategoryRoutes = mode === "invest";

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        locationFieldRef.current &&
        !locationFieldRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLocationChange(event) {
    const value = event.target.value;
    setLocation(value);
    setCitySuggestions(searchIndianCities(value));
    setShowSuggestions(true);
  }

  function handleCitySelect(entry) {
    setLocation(entry.label);
    setCitySuggestions([]);
    setShowSuggestions(false);
  }

  function handleModeChange(slug) {
    setMode(slug);
    setPropertyType(PLACEHOLDER);
  }

  function handleTypeChange(event) {
    const value = event.target.value;
    setPropertyType(value);

    if (value === PLACEHOLDER) return;

    if (hasCategoryRoutes) {
      const category = typeOptions.find((option) => option.label === value);
      router.push(category?.href ?? `/${mode}/${category?.key}`);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());

    if (propertyType !== PLACEHOLDER && !hasCategoryRoutes) {
      params.set("type", propertyType);
    }

    const modeLabel = MODES.find((m) => m.slug === mode)?.label || mode;
    const queryParts = [];
    if (propertyType !== PLACEHOLDER && !hasCategoryRoutes) queryParts.push(propertyType);
    queryParts.push(modeLabel);
    if (location.trim()) queryParts.push(location.trim());

    trackEvent("search", {
      search_term: queryParts.join(" • "),
      mode,
      property_type: propertyType !== PLACEHOLDER ? propertyType : undefined,
      location: location.trim() || undefined,
    });

    const query = params.toString();
    router.push(`/${mode}${query ? `?${query}` : ""}`);
  }

  return (
    <div className="rounded-3xl border border-cream/12 bg-navy-950/92 p-5 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.95)] backdrop-blur-md sm:p-8 lg:px-10 lg:py-9">
      <p className="tracked-label mb-5 text-[11px] font-medium text-gold-400">
        Start Your Search
      </p>

      <div className="gold-scrollbar -mx-1 flex gap-2 overflow-x-scroll px-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
        {MODES.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => handleModeChange(item.slug)}
            className={`tracked-label shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition ${
              mode === item.slug
                ? "border-gold-400 text-gold-400"
                : "border-transparent text-muted hover:text-cream"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 lg:flex-row">
        <div ref={locationFieldRef} className="relative flex-1">
          <div className="flex items-center gap-2.5 rounded-md border border-navy-700/70 bg-navy-900/80 px-4 transition focus-within:border-gold-500">
            <span className="shrink-0 text-cream/70">
              <MdLocationOn className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={location}
              onChange={handleLocationChange}
              onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search city, locality or project"
              autoComplete="off"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls="city-suggestions-list"
              aria-autocomplete="list"
              className="w-full bg-transparent py-3.5 text-sm text-cream placeholder:text-muted focus:outline-none"
            />
          </div>

          {showSuggestions && citySuggestions.length > 0 && (
            <ul
              id="city-suggestions-list"
              className="gold-scrollbar absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-md border border-navy-700/70 bg-navy-900 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9)]"
            >
              {citySuggestions.map((entry) => (
                <li key={entry.label}>
                  <button
                    type="button"
                    onClick={() => handleCitySelect(entry)}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-cream transition hover:bg-navy-800"
                  >
                    <MdLocationOn className="h-4 w-4 shrink-0 text-gold-400" />
                    <span>
                      {entry.city}
                      <span className="text-muted">, {entry.state}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative lg:w-52">
          <select
            value={propertyType}
            onChange={handleTypeChange}
            className={SELECT_CLASS}
          >
            <option value={PLACEHOLDER} className="bg-navy-900">
              {PLACEHOLDER}
            </option>
            {typeOptions.map((option) => (
              <option key={option.key} value={option.label} className="bg-navy-900">
                {option.label}
              </option>
            ))}
          </select>
          <FiChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/70"
          />
        </div>

        <button
          type="submit"
          className="tracked-label flex items-center justify-center gap-2.5 rounded-md bg-gold-400 px-8 py-3.5 text-xs font-semibold text-navy-950 transition hover:bg-gold-300 lg:w-auto"
        >
          Search Properties
          <MdSearch className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
