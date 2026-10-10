import {
  MdHomeWork,
  MdErrorOutline,
  MdWifiOff,
  MdHourglassBottom,
  MdSearchOff,
  MdLockOutline,
  MdTimerOff,
  MdCheckCircle,
  MdSignalWifiStatusbarConnectedNoInternet4,
  MdConstruction,
  MdBlock,
  MdMapsHomeWork,
} from "react-icons/md";

/**
 * Single source of truth for every "state screen" shown across the site and
 * admin panel. `tone` picks the accent (gold = on-brand, red = urgent) —
 * both renderers (StateScreen for the public site, AdminStateScreen for the
 * admin panel) read from here so the copy never drifts between the two.
 * Messages are kept in simple, plain English.
 */
export const STATE_COPY = {
  empty: {
    icon: MdHomeWork,
    title: "No Properties Yet",
    message: "There is nothing here right now. Please check back later.",
    tone: "gold",
  },
  loading: {
    icon: MdHourglassBottom,
    title: "Loading…",
    message: "Please wait a moment.",
    tone: "gold",
    spin: true,
  },
  error: {
    icon: MdErrorOutline,
    title: "Something Went Wrong",
    message: "We could not complete this. Please try again.",
    tone: "red",
  },
  offline: {
    icon: MdWifiOff,
    title: "No Internet Connection",
    message: "Please check your internet connection and try again.",
    tone: "red",
  },
  slow: {
    icon: MdSignalWifiStatusbarConnectedNoInternet4,
    title: "Slow Connection",
    message: "This is taking longer than usual. Please wait.",
    tone: "gold",
    spin: true,
  },
  noResults: {
    icon: MdSearchOff,
    title: "No Results Found",
    message: "Try changing your search or filters.",
    tone: "gold",
  },
  forbidden: {
    icon: MdLockOutline,
    title: "Access Denied",
    message: "You do not have permission to view this.",
    tone: "red",
  },
  sessionExpired: {
    icon: MdTimerOff,
    title: "Session Expired",
    message: "Please log in again to continue.",
    tone: "red",
  },
  success: {
    icon: MdCheckCircle,
    title: "Success",
    message: "Your request was completed.",
    tone: "gold",
  },
  notFound: {
    icon: MdMapsHomeWork,
    title: "Page Not Found",
    message: "This page does not exist.",
    tone: "gold",
  },
  maintenance: {
    icon: MdConstruction,
    title: "Under Maintenance",
    message: "We are working on this. Please check back soon.",
    tone: "gold",
  },
  rateLimited: {
    icon: MdBlock,
    title: "Too Many Requests",
    message: "Please slow down and try again in a moment.",
    tone: "red",
  },
};
