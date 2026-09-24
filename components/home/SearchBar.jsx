"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MdLocationOn, MdSearch } from "react-icons/md";
import { FiChevronDown, FiAlertCircle, FiClock, FiX } from "react-icons/fi";
import { INVEST_CATEGORIES, RESIDENTIAL_TYPE_OPTIONS } from "@/lib/properties";
import { searchIndianCities } from "@/lib/indianCities";
import { trackEvent } from "@/lib/gtag";

const MODES = [
  { label: "Buy", slug: "buy" },
  { label: "Rent", slug: "rent" },
  { label: "Invest", slug: "invest" },
];

const PLACEHOLDER = "Property Type";

const RECENT_SEARCHES_KEY = "se_recent_city_searches";
const MAX_RECENT_SEARCHES = 5;

const SIMPLE_TYPES = RESIDENTIAL_TYPE_OPTIONS.map((label) => ({ key: label, label }));

const BHK_TYPES = ["House", "Flat"];

const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];

const PROPERTY_TYPE_OPTIONS = {
  buy: SIMPLE_TYPES,
  rent: SIMPLE_TYPES,
  invest: [
    ...INVEST_CATEGORIES,
    { key: "company-project", label: "Company Projects", href: "/projects" },
  ],
};

const SELECT_CLASS =
  "w-full appearance-none rounded-md border bg-navy-900/80 px-4 py-3.5 text-sm text-cream transition focus:border-gold-500 focus:outline-none";

function ValidationBubble({ message }) {
  return (
    <div className="absolute left-0 top-full z-30 mt-2 flex items-center gap-2 rounded-md border border-gold-500/60 bg-navy-900 px-3 py-2 text-xs text-cream shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9)]">
      <span
        aria-hidden="true"
        className="absolute -top-[5px] left-4 h-2.5 w-2.5 rotate-45 border-l border-t border-gold-500/60 bg-navy-900"
      />
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-gold-500 text-navy-950">
        <FiAlertCircle className="h-3 w-3" />
      </span>
      <span className="whitespace-nowrap font-medium text-cream">{message}</span>
    </div>
  );
}

export default function SearchBar() {
  const router = useRouter();
  const [mode, setMode] = useState(MODES[0].slug);
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bhk, setBhk] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const locationFieldRef = useRef(null);

  const locationInvalid = showErrors && !location.trim();
  const propertyTypeInvalid = showErrors && !propertyType;

  const typeOptions = PROPERTY_TYPE_OPTIONS[mode] ?? [];
  const hasCategoryRoutes = mode === "invest";
  const showBhk = BHK_TYPES.includes(propertyType);

  const showingRecent = citySuggestions.length === 0 && recentSearches.length > 0;
  const dropdownEntries = showingRecent ? recentSearches : citySuggestions;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {
      /* localStorage unavailable */
    }
  }, []);

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

  function saveRecentSearch(entry) {
    setRecentSearches((prev) => {
      const next = [entry, ...prev.filter((item) => item.label !== entry.label)].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      try {
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        /* localStorage unavailable */
      }
      return next;
    });
  }

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
    saveRecentSearch({ city: entry.city, state: entry.state, label: entry.label });
  }

  function handleModeChange(slug) {
    setMode(slug);
    setPropertyType("");
    setBhk("");
  }

  function handleTypeChange(event) {
    const value = event.target.value;
    setPropertyType(value);
    if (!BHK_TYPES.includes(value)) setBhk("");
  }

  function handleBhkChange(event) {
    setBhk(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!location.trim() || !propertyType) {
      setShowErrors(true);
      return;
    }

    saveRecentSearch({ label: location.trim() });

    const params = new URLSearchParams();
    params.set("location", location.trim());

    if (!hasCategoryRoutes) {
      params.set("type", propertyType);
    }

    if (showBhk && bhk) {
      params.set("bhk", bhk);
    }

    const modeLabel = MODES.find((m) => m.slug === mode)?.label || mode;
    const queryParts = [];
    if (!hasCategoryRoutes) queryParts.push(propertyType);
    if (showBhk && bhk) queryParts.push(bhk);
    queryParts.push(modeLabel);
    queryParts.push(location.trim());

    trackEvent("search", {
      search_term: queryParts.join(" • "),
      mode,
      property_type: propertyType,
      bhk: showBhk ? bhk : undefined,
      location: location.trim(),
    });

    const query = params.toString();

    if (hasCategoryRoutes) {
      const category = typeOptions.find((option) => option.label === propertyType);
      const basePath = category?.href ?? `/${mode}/${category?.key}`;
      router.push(`${basePath}?${query}`);
      return;
    }

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

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-5 flex flex-col gap-3 lg:flex-row"
      >
        <div className="relative lg:w-52">
          <select
            value={propertyType}
            onChange={handleTypeChange}
            className={`${SELECT_CLASS} ${
              propertyTypeInvalid ? "border-gold-500" : "border-navy-700/70"
            }`}
          >
            <option value="" disabled hidden className="bg-navy-900">
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
          {propertyTypeInvalid && <ValidationBubble message="Please select a property type." />}
        </div>

        {showBhk && (
          <div className="relative lg:w-40">
            <select
              value={bhk}
              onChange={handleBhkChange}
              className={`${SELECT_CLASS} border-navy-700/70`}
            >
              <option value="" className="bg-navy-900">
                BHK
              </option>
              {BHK_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-navy-900">
                  {option}
                </option>
              ))}
            </select>
            <FiChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/70"
            />
          </div>
        )}

        <div ref={locationFieldRef} className="relative flex-1">
          <div
            className={`flex items-center gap-2.5 rounded-md border bg-navy-900/80 px-4 transition focus-within:border-gold-500 ${
              locationInvalid ? "border-gold-500" : "border-navy-700/70"
            }`}
          >
            <span className="shrink-0 text-cream/70">
              <MdLocationOn className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={location}
              onChange={handleLocationChange}
              onFocus={() =>
                (citySuggestions.length > 0 || showingRecent) && setShowSuggestions(true)
              }
              placeholder="Search city, locality or project"
              autoComplete="off"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls="city-suggestions-list"
              aria-autocomplete="list"
              className="w-full bg-transparent py-3.5 text-sm text-cream placeholder:text-muted focus:outline-none"
            />
            {location && (
              <button
                type="button"
                aria-label="Clear location"
                onClick={() => {
                  setLocation("");
                  setCitySuggestions([]);
                  locationFieldRef.current?.querySelector("input")?.focus();
                }}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-navy-800 hover:text-cream"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>

          {locationInvalid && <ValidationBubble message="Please fill in this field." />}

          {showSuggestions && dropdownEntries.length > 0 && (
            <ul
              id="city-suggestions-list"
              className="gold-scrollbar absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-md border border-navy-700/70 bg-navy-900 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9)] sm:max-h-72"
            >
              {showingRecent && (
                <li className="sticky top-0 bg-navy-900 px-4 py-2">
                  <span className="tracked-label text-[10px] text-muted">Recent Searches</span>
                </li>
              )}
              {dropdownEntries.map((entry) => (
                <li key={entry.label}>
                  <button
                    type="button"
                    onClick={() => handleCitySelect(entry)}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-cream transition hover:bg-navy-800"
                  >
                    {showingRecent ? (
                      <FiClock className="h-4 w-4 shrink-0 text-gold-400" />
                    ) : (
                      <MdLocationOn className="h-4 w-4 shrink-0 text-gold-400" />
                    )}
                    <span className="truncate">
                      {entry.city ? (
                        <>
                          {entry.city}
                          {entry.state && <span className="text-muted">, {entry.state}</span>}
                        </>
                      ) : (
                        entry.label
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
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
