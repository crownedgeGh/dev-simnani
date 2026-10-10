import Link from "next/link";
import { STATE_COPY } from "@/lib/stateCopy";

const TONE_CLASSES = {
  gold: "bg-[#faf8f5] text-[#f0b429]",
  red: "bg-red-50 text-red-500",
};

/** Admin-panel equivalent of StateScreen, styled to match the light
 * admin theme (white cards, #e8e0d5 borders, #f0b429 accent) instead of
 * the public site's dark navy/gold theme. Same STATE_COPY presets. */
export default function AdminStateScreen({
  variant,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
}) {
  const preset = STATE_COPY[variant] || {};
  const Icon = preset.icon;
  const resolvedTitle = title ?? preset.title;
  const resolvedMessage = message ?? preset.message;
  const tone = TONE_CLASSES[preset.tone] || TONE_CLASSES.gold;

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border border-[#e8e0d5] bg-white text-center ${
        compact ? "px-6 py-10" : "px-6 py-16"
      }`}
    >
      {Icon && (
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className={`h-6 w-6 ${preset.spin ? "animate-spin" : ""}`} />
        </span>
      )}
      <div>
        <p className="text-sm font-semibold text-[#374151]">{resolvedTitle}</p>
        {resolvedMessage && <p className="mt-1 max-w-sm text-xs text-[#9ca3af]">{resolvedMessage}</p>}
      </div>
      {actionLabel &&
        (actionHref ? (
          <Link
            href={actionHref}
            className="mt-1 rounded-xl bg-[#f0b429] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#d79c1f]"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="mt-1 rounded-xl bg-[#f0b429] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#d79c1f]"
          >
            {actionLabel}
          </button>
        ))}
    </div>
  );
}

const preset = (variant) => {
  function Preset(props) {
    return <AdminStateScreen variant={variant} {...props} />;
  }
  Preset.displayName = `AdminStateScreen(${variant})`;
  return Preset;
};

export const AdminEmptyState = preset("empty");
export const AdminLoadingState = preset("loading");
export const AdminErrorState = preset("error");
export const AdminNoInternetState = preset("offline");
export const AdminSlowNetworkState = preset("slow");
export const AdminNoSearchResultsState = preset("noResults");
export const AdminPermissionDeniedState = preset("forbidden");
export const AdminSessionExpiredState = preset("sessionExpired");
export const AdminSuccessState = preset("success");
export const AdminNotFoundState = preset("notFound");
export const AdminMaintenanceState = preset("maintenance");
export const AdminRateLimitedState = preset("rateLimited");
