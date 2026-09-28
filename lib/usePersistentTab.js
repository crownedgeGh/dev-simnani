"use client";

import { useCallback, useSyncExternalStore } from "react";

// Keeps a dashboard's active tab in sessionStorage so a page refresh lands
// back on whichever section the user was viewing, instead of snapping to
// the default tab. Uses useSyncExternalStore (server snapshot = defaultTab)
// so the first client render always matches SSR and avoids hydration
// mismatches, the same pattern used for the light/dark theme toggle.
const listenersByKey = {};

function getListeners(key) {
  if (!listenersByKey[key]) listenersByKey[key] = [];
  return listenersByKey[key];
}

function emitChange(key) {
  getListeners(key).forEach((listener) => listener());
}

export function usePersistentTab(storageKey, validTabs, defaultTab) {
  const subscribe = useCallback(
    (listener) => {
      const listeners = getListeners(storageKey);
      listeners.push(listener);
      return () => {
        listenersByKey[storageKey] = listeners.filter((l) => l !== listener);
      };
    },
    [storageKey]
  );

  const getSnapshot = useCallback(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved && validTabs.includes(saved) ? saved : defaultTab;
    } catch {
      return defaultTab;
    }
  }, [storageKey, validTabs, defaultTab]);

  const getServerSnapshot = useCallback(() => defaultTab, [defaultTab]);

  const tab = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTab = useCallback(
    (nextTab) => {
      try {
        sessionStorage.setItem(storageKey, nextTab);
      } catch {
        // ignore storage access errors
      }
      emitChange(storageKey);
    },
    [storageKey]
  );

  return [tab, setTab];
}
