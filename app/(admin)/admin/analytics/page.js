"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MdPeople,
  MdVisibility,
  MdBolt,
  MdTravelExplore,
  MdSearch,
  MdInsights,
  MdArticle,
  MdWarningAmber,
} from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";
import RankedBarList from "@/components/admin/analytics/RankedBarList";
import AdminSearchableSelect from "@/components/admin/ui/AdminSearchableSelect";
import AdminFormField from "@/components/admin/ui/AdminFormField";

const ALL_STATES = "All States";
const ALL_CITIES = "All Cities";

const SETUP_STEPS = [
  "Create a GA4 property and add the Measurement ID to NEXT_PUBLIC_GA_MEASUREMENT_ID.",
  "In Google Cloud Console, enable the \"Google Analytics Data API\" and create a Service Account + JSON key.",
  "In GA4 Admin > Property Access Management, add the service account's email as a Viewer.",
  "Copy the numeric GA4 Property ID (GA4 Admin > Property Settings) into GA4_PROPERTY_ID.",
  "Set GA4_SERVICE_ACCOUNT_EMAIL and GA4_SERVICE_ACCOUNT_PRIVATE_KEY from the JSON key.",
  "In GA4 Admin > Custom Definitions, register an event-scoped custom dimension named \"search_term\" for the Top Search Terms panel.",
];

function trendMax(rows, key) {
  return Math.max(...rows.map((r) => Number(r[key]) || 0), 1);
}

function formatDate(yyyymmdd) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  const d = new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function AdminAnalyticsPage() {
  const [state, setState] = useState({ loading: true, configured: null, reports: null, error: null });
  const [refreshing, setRefreshing] = useState(false);
  const [locationFilter, setLocationFilter] = useState({ state: "", city: "" });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load analytics");
      setState({ loading: false, configured: data.configured, reports: data.reports, error: null });
    } catch (err) {
      setState({ loading: false, configured: null, reports: null, error: err.message });
    }
  }, []);

  // Re-fetches only the Top Search Queries panel, filtered by state/city —
  // the rest of the dashboard (KPIs, trend, realtime) doesn't need to reload.
  const loadSearchTerms = useCallback(async (stateName, cityName) => {
    const params = new URLSearchParams({ searchTermsOnly: "1" });
    if (stateName) params.set("state", stateName);
    if (cityName) params.set("city", cityName);
    try {
      const res = await fetch(`/api/admin/analytics?${params.toString()}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load search queries");
      setState((prev) => ({
        ...prev,
        reports: { ...prev.reports, topSearchTerms: data.reports.topSearchTerms },
      }));
    } catch (err) {
      console.error("Failed to load filtered search queries:", err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    if (locationFilter.state || locationFilter.city) {
      await loadSearchTerms(locationFilter.state, locationFilter.city);
    }
    setRefreshing(false);
  }

  function handleStateChange(value) {
    const nextState = value === ALL_STATES ? "" : value;
    setLocationFilter({ state: nextState, city: "" });
    loadSearchTerms(nextState, "");
  }

  function handleCityChange(value) {
    const nextCity = value === ALL_CITIES ? "" : value;
    setLocationFilter((prev) => ({ ...prev, city: nextCity }));
    loadSearchTerms(locationFilter.state, nextCity);
  }

  const overview = state.reports?.overview?.data?.[0] || {};
  const trend = state.reports?.trend?.data || [];
  const realtimeOverview = state.reports?.realtimeOverview?.data?.[0] || {};
  const realtimeEvents = state.reports?.realtimeEvents;

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Google Analytics 4 — search queries, filters, leads & site activity"
        onRefresh={state.configured ? handleRefresh : undefined}
        isRefreshing={refreshing}
      />

      {state.loading && (
        <p className="py-10 text-center text-sm text-[#9ca3af]">Loading GA4 data…</p>
      )}

      {!state.loading && state.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Failed to load analytics: {state.error}
        </div>
      )}

      {!state.loading && !state.error && state.configured === false && (
        <div className="rounded-2xl border border-[#e8e0d5] bg-white p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff8e1]">
              <MdWarningAmber size={20} className="text-[#f0b429]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1a1a2e]">Google Analytics isn&apos;t connected yet</h3>
              <p className="mt-1 text-sm text-[#9ca3af]">
                The site already sends events to GA4 once a Measurement ID is set. To see the data here,
                finish this one-time setup in <code className="rounded bg-[#f5f2ec] px-1">.env.local</code>:
              </p>
            </div>
          </div>
          <ol className="mt-4 flex flex-col gap-2 pl-1">
            {SETUP_STEPS.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#1a1a2e]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fff8e1] text-[11px] font-semibold text-[#d97706]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {!state.loading && !state.error && state.configured && (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-[#e8e0d5] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#1a1a2e]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                Right Now — Last 30 Minutes
              </p>
              <span className="text-xs text-[#9ca3af]">Use this to test — updates within ~1 minute</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-bold text-[#d97706]">{(realtimeOverview.activeUsers ?? 0).toLocaleString()}</p>
                <p className="text-xs text-[#9ca3af]">Active users right now</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#d97706]">{(realtimeOverview.eventCount ?? 0).toLocaleString()}</p>
                <p className="text-xs text-[#9ca3af]">Events in last 30 min</p>
              </div>
            </div>
            {realtimeEvents && (
              <div className="mt-4 border-t border-[#f5f2ec] pt-4">
                {realtimeEvents.error ? (
                  <p className="text-xs text-[#9ca3af]">{realtimeEvents.error}</p>
                ) : (
                  <RankedBarList
                    rows={realtimeEvents.data}
                    labelKey="eventName"
                    valueKey="eventCount"
                    emptyMessage="No activity in the last 30 minutes. Browse the site (search, view a property) and click Refresh."
                  />
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminKpiCard
              title="Active Users"
              value={(overview.activeUsers ?? 0).toLocaleString()}
              subtitle="Last 28 days"
              icon={MdPeople}
              color="blue"
            />
            <AdminKpiCard
              title="Sessions"
              value={(overview.sessions ?? 0).toLocaleString()}
              subtitle="Last 28 days"
              icon={MdTravelExplore}
              color="green"
            />
            <AdminKpiCard
              title="Page Views"
              value={(overview.screenPageViews ?? 0).toLocaleString()}
              subtitle="Last 28 days"
              icon={MdVisibility}
              color="purple"
            />
            <AdminKpiCard
              title="Total Events"
              value={(overview.eventCount ?? 0).toLocaleString()}
              subtitle="Searches, leads, clicks..."
              icon={MdBolt}
              color="gold"
            />
          </div>

          {trend.length > 0 && (
            <div className="rounded-2xl border border-[#e8e0d5] bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#1a1a2e]">
                <MdInsights className="text-[#f0b429]" size={18} />
                Users & Sessions — Last 14 Days
              </p>
              <div className="mt-4 flex h-32 items-end gap-1.5 overflow-x-auto sm:gap-2">
                {trend.map((row) => {
                  const max = trendMax(trend, "sessions");
                  const height = Math.max(((Number(row.sessions) || 0) / max) * 100, 4);
                  return (
                    <div key={row.date} className="flex min-w-[28px] flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-24 w-full items-end">
                        <div
                          className="w-full rounded-t-sm bg-[#f0b429]"
                          style={{ height: `${height}%` }}
                          title={`${row.sessions} sessions`}
                        />
                      </div>
                      <span className="text-[10px] text-[#9ca3af]">{formatDate(row.date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[#e8e0d5] bg-white p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#1a1a2e]">
              <MdSearch className="text-[#f0b429]" size={18} />
              Top Search Queries
            </p>
            <p className="mt-1 text-xs text-[#9ca3af]">
              Exactly what visitors searched for — property type, buy/rent, city & budget combined.
            </p>
            {!state.reports.topSearchTerms.error && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AdminFormField label="State" id="search-terms-state">
                  <AdminSearchableSelect
                    id="search-terms-state"
                    value={locationFilter.state || ALL_STATES}
                    onChange={handleStateChange}
                    options={[ALL_STATES, ...(state.reports.topSearchTerms.availableStates || [])]}
                    placeholder={ALL_STATES}
                  />
                </AdminFormField>
                <AdminFormField label="City" id="search-terms-city">
                  <AdminSearchableSelect
                    id="search-terms-city"
                    value={locationFilter.city || ALL_CITIES}
                    onChange={handleCityChange}
                    options={[ALL_CITIES, ...(state.reports.topSearchTerms.availableCities || [])]}
                    placeholder={ALL_CITIES}
                    disabled={!(state.reports.topSearchTerms.availableCities || []).length}
                  />
                </AdminFormField>
              </div>
            )}
            <div className="mt-4">
              {state.reports.topSearchTerms.error ? (
                <p className="py-6 text-center text-xs text-[#9ca3af]">
                  {state.reports.topSearchTerms.error.includes("customEvent")
                    ? 'Register the "search_term" event-scoped custom dimension in GA4 Admin > Custom Definitions to see this.'
                    : state.reports.topSearchTerms.error}
                </p>
              ) : (
                <RankedBarList
                  rows={state.reports.topSearchTerms.data}
                  labelKey="customEvent:search_term"
                  valueKey="eventCount"
                  emptyMessage={
                    locationFilter.state || locationFilter.city
                      ? "No searches recorded yet for this state/city."
                      : "No searches recorded yet — try searching on the site, then check the Right Now panel above first."
                  }
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#e8e0d5] bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#1a1a2e]">
                <MdBolt className="text-[#f0b429]" size={18} />
                Top Activities
              </p>
              <div className="mt-4">
                {state.reports.topEvents.error ? (
                  <p className="py-6 text-center text-xs text-[#9ca3af]">{state.reports.topEvents.error}</p>
                ) : (
                  <RankedBarList
                    rows={state.reports.topEvents.data}
                    labelKey="eventName"
                    valueKey="eventCount"
                    emptyMessage="No events recorded yet."
                  />
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#e8e0d5] bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#1a1a2e]">
                <MdArticle className="text-[#f0b429]" size={18} />
                Top Pages
              </p>
              <div className="mt-4">
                {state.reports.topPages.error ? (
                  <p className="py-6 text-center text-xs text-[#9ca3af]">{state.reports.topPages.error}</p>
                ) : (
                  <RankedBarList
                    rows={state.reports.topPages.data}
                    labelKey="pagePath"
                    valueKey="screenPageViews"
                    emptyMessage="No page views recorded yet."
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
