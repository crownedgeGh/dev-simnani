import Link from "next/link";

export default function EmptyState({ title, message, actionHref, actionLabel }) {
  return (
    <div className="flex flex-col items-center gap-3 border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
      <h3 className="font-display text-lg text-cream">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="tracked-label mt-2 bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
