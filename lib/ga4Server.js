/**
 * ga4Server.js
 * ------------
 * Server-only helper around the Google Analytics Data API (GA4 reporting).
 * Powers /api/admin/analytics, which feeds the /admin/analytics dashboard.
 *
 * Needs three env vars (see .env.local for the full setup checklist):
 *   GA4_PROPERTY_ID, GA4_SERVICE_ACCOUNT_EMAIL, GA4_SERVICE_ACCOUNT_PRIVATE_KEY
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";

export function isGa4Configured() {
  return Boolean(
    process.env.GA4_PROPERTY_ID &&
      process.env.GA4_SERVICE_ACCOUNT_EMAIL &&
      process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY
  );
}

let client = null;
function getClient() {
  if (client) return client;
  client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA4_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
  });
  return client;
}

function propertyPath() {
  return `properties/${process.env.GA4_PROPERTY_ID}`;
}

function rowsToObjects(response) {
  const dimensionNames = (response.dimensionHeaders || []).map((h) => h.name);
  const metricNames = (response.metricHeaders || []).map((h) => h.name);
  return (response.rows || []).map((row) => {
    const obj = {};
    row.dimensionValues.forEach((v, i) => (obj[dimensionNames[i]] = v.value));
    row.metricValues.forEach((v, i) => (obj[metricNames[i]] = Number(v.value)));
    return obj;
  });
}

/** Runs each named report independently so one failure (e.g. a custom
 * dimension that hasn't been registered in GA4 yet) doesn't take down the
 * whole dashboard — the caller gets { data } or { error } per key. */
export async function getDashboardReports() {
  const analyticsDataClient = getClient();
  const property = propertyPath();

  const jobs = {
    // Realtime — last ~30 minutes, available within seconds. Use this to
    // verify tracking is working right after clicking around the site;
    // the reports below can take hours to reflect new activity.
    realtimeOverview: () =>
      analyticsDataClient.runRealtimeReport({
        property,
        metrics: [{ name: "activeUsers" }, { name: "eventCount" }],
      }),
    realtimeEvents: () =>
      analyticsDataClient.runRealtimeReport({
        property,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 10,
      }),
    overview: () =>
      analyticsDataClient.runReport({
        property,
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "eventCount" },
        ],
      }),
    trend: () =>
      analyticsDataClient.runReport({
        property,
        dateRanges: [{ startDate: "13daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
    topEvents: () =>
      analyticsDataClient.runReport({
        property,
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 15,
      }),
    topSearchTerms: () =>
      analyticsDataClient.runReport({
        property,
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        dimensions: [{ name: "customEvent:search_term" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { value: "search" },
          },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 10,
      }),
    topPages: () =>
      analyticsDataClient.runReport({
        property,
        dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
  };

  const entries = Object.entries(jobs);
  const results = await Promise.allSettled(entries.map(([, run]) => run()));

  const out = {};
  results.forEach((result, i) => {
    const [key] = entries[i];
    if (result.status === "fulfilled") {
      const [response] = result.value;
      out[key] = { data: rowsToObjects(response) };
    } else {
      out[key] = { error: result.reason?.details || result.reason?.message || "Report failed" };
    }
  });
  return out;
}
