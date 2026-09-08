/**
 * adminAxios.js
 * -------------
 * Axios instance with a localStorage adapter interceptor.
 *
 * Maps HTTP verbs + URL patterns to localStorage CRUD operations.
 * No real HTTP requests are made — this simulates a REST API backed by localStorage.
 *
 * Supported patterns:
 *   GET    /admin/:collection          → read all
 *   POST   /admin/:collection          → append item
 *   PUT    /admin/:collection/:id      → replace by id
 *   PATCH  /admin/:collection/:id      → partial merge by id
 *   DELETE /admin/:collection/:id      → remove by id
 */

import axios from "axios";
import { ADMIN_KEYS, readCollection, writeCollection } from "./adminStorage";

// Collection name → localStorage key mapping
const COLLECTION_MAP = {
  properties: ADMIN_KEYS.properties,
  users: ADMIN_KEYS.users,
  projects: ADMIN_KEYS.projects,
  leads: ADMIN_KEYS.leads,
  callbacks: ADMIN_KEYS.callbacks,
  "freelancer-leads": ADMIN_KEYS.freelancerLeads,
  "freelancer-properties": ADMIN_KEYS.freelancerProperties,
  "cp-leads": ADMIN_KEYS.cpLeads,
  "cp-network": ADMIN_KEYS.cpNetwork,
  "campaign-videos": ADMIN_KEYS.campaignVideos,
  commissions: ADMIN_KEYS.commissions,
  "promotion-assets": ADMIN_KEYS.promotionAssets,
  "activity-log": ADMIN_KEYS.activityLog,
};

function getStorageKey(collection) {
  return COLLECTION_MAP[collection] || `se_admin_${collection}`;
}

function parseUrl(url) {
  // Strip leading slash, e.g. "/admin/properties/buy-1" → ["admin","properties","buy-1"]
  const parts = url.replace(/^\//, "").split("/");
  // parts[0] === "admin"
  const collection = parts[1];
  const id = parts[2] || null;
  return { collection, id };
}

function appendActivityLog(action, entityType, entityId, entityTitle) {
  try {
    const key = ADMIN_KEYS.activityLog;
    const log = readCollection(key) || [];
    log.unshift({
      action,
      entityType,
      entityId,
      entityTitle: entityTitle || entityId,
      timestamp: new Date().toISOString(),
      adminEmail: "admin@simnani.com",
    });
    // Keep only last 100 entries
    writeCollection(key, log.slice(0, 100));
  } catch {
    // Non-fatal
  }
}

// Create the axios instance (baseURL is a dummy local origin — interceptors catch all)
const adminAxios = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 500,
});

// ---------------------------------------------------------------------------
// Request interceptor — intercept every request and handle locally
// ---------------------------------------------------------------------------
adminAxios.interceptors.request.use(
  (config) => {
    const { method, url, data } = config;
    const { collection, id } = parseUrl(url.replace(config.baseURL || "", "").replace("http://localhost:3001", ""));
    const storageKey = getStorageKey(collection);

    let responseData;
    let status = 200;

    try {
      const items = readCollection(storageKey) || [];

      switch (method.toLowerCase()) {
        case "get": {
          responseData = items;
          break;
        }

        case "post": {
          const newItem = typeof data === "string" ? JSON.parse(data) : data;
          const updated = [newItem, ...items];
          writeCollection(storageKey, updated);
          appendActivityLog("created", collection, newItem.id, newItem.title || newItem.name || newItem.customer || newItem.fullName);
          responseData = { item: newItem, data: updated };
          status = 201;
          break;
        }

        case "put": {
          if (!id) throw new Error("PUT requires an id");
          const putData = typeof data === "string" ? JSON.parse(data) : data;
          const updated = items.map((item) => (item.id === id ? putData : item));
          writeCollection(storageKey, updated);
          appendActivityLog("updated", collection, id, putData.title || putData.name || putData.customer || putData.fullName);
          responseData = { item: putData, data: updated };
          break;
        }

        case "patch": {
          if (!id) throw new Error("PATCH requires an id");
          const patchData = typeof data === "string" ? JSON.parse(data) : data;
          let patchedItem = null;
          const updated = items.map((item) => {
            if (item.id === id) {
              patchedItem = { ...item, ...patchData };
              return patchedItem;
            }
            return item;
          });
          writeCollection(storageKey, updated);
          appendActivityLog("updated", collection, id, patchedItem?.title || patchedItem?.name || patchedItem?.customer || patchedItem?.fullName || id);
          responseData = { item: patchedItem, data: updated };
          break;
        }

        case "delete": {
          if (!id) throw new Error("DELETE requires an id");
          const deletedItem = items.find((item) => item.id === id);
          const updated = items.filter((item) => item.id !== id);
          writeCollection(storageKey, updated);
          appendActivityLog("deleted", collection, id, deletedItem?.title || deletedItem?.name || deletedItem?.customer || deletedItem?.fullName || id);
          responseData = { id, data: updated };
          break;
        }

        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      // Abort the real request and return mock response
      config.adapter = () =>
        Promise.resolve({
          data: responseData,
          status,
          statusText: "OK",
          headers: {},
          config,
        });
    } catch (err) {
      config.adapter = () =>
        Promise.reject({
          response: {
            data: { error: err.message },
            status: 500,
            statusText: "Internal Error",
          },
        });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default adminAxios;
