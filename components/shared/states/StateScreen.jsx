"use client";

import Link from "next/link";
import { STATE_COPY } from "@/lib/stateCopy";

const TONE_CLASSES = {
  gold: "bg-navy-950 text-gold-400",
  red: "bg-red-500/10 text-red-400",
};

/** Themed full-block state screen for the public site — drop into any card,
 * section, or page body wherever an empty/loading/error/etc. state is
 * needed. Pass `variant` for the preset copy+icon, or override any piece. */
export default function StateScreen({
  variant,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  onSecondary,
  compact = false,
  children,
}) {
  const preset = STATE_COPY[variant] || {};
  const Icon = preset.icon;
  const resolvedTitle = title ?? preset.title;
  const resolvedMessage = message ?? preset.message;
  const tone = TONE_CLASSES[preset.tone] || TONE_CLASSES.gold;

  return (
    <div
      className={`flex flex-col items-center gap-3 border border-navy-700/60 bg-navy-900 text-center ${
        compact ? "px-6 py-10" : "px-6 py-16 sm:py-20"
      }`}
    >
      {Icon && (
        <span className={`flex h-14 w-14 items-center justify-center rounded-full ${tone}`}>
          <Icon className={`h-7 w-7 ${preset.spin ? "animate-spin" : ""}`} />
        </span>
      )}
      <h3 className="font-display text-lg text-cream sm:text-xl">{resolvedTitle}</h3>
      {resolvedMessage && <p className="max-w-sm text-sm text-muted">{resolvedMessage}</p>}
      {children}
      {(actionLabel || secondaryLabel) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {actionLabel &&
            (actionHref ? (
              <Link
                href={actionHref}
                className="tracked-label flex min-h-11 items-center rounded-full bg-gold-400 px-6 py-3 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98]"
              >
                {actionLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onAction}
                className="tracked-label flex min-h-11 items-center rounded-full bg-gold-400 px-6 py-3 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98]"
              >
                {actionLabel}
              </button>
            ))}
          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              className="tracked-label flex min-h-11 items-center rounded-full border border-navy-700/60 px-6 py-3 text-xs text-cream transition hover:border-gold-500 hover:text-gold-400 active:scale-[0.98]"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const preset = (variant) => {
  function Preset(props) {
    return <StateScreen variant={variant} {...props} />;
  }
  Preset.displayName = `StateScreen(${variant})`;
  return Preset;
};

export const EmptyState = preset("empty");
export const LoadingState = preset("loading");
export const ErrorState = preset("error");
export const NoInternetState = preset("offline");
export const SlowNetworkState = preset("slow");
export const NoSearchResultsState = preset("noResults");
export const PermissionDeniedState = preset("forbidden");
export const SessionExpiredState = preset("sessionExpired");
export const SuccessState = preset("success");
export const NotFoundState = preset("notFound");
export const MaintenanceState = preset("maintenance");
export const RateLimitedState = preset("rateLimited");
