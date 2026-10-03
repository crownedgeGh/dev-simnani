import Link from "next/link";

/**
 * "Nearby localities" internal-linking block for SEO locality pages — keeps
 * programmatic pages from being orphaned with no outbound internal links.
 * Falls back to the city-level browse route when no sibling locality page
 * is available yet.
 */
export default function NearbyLocalities({ links, fallbackHref, fallbackLabel }) {
  if (!links || links.length === 0) {
    return (
      <div className="rounded-2xl border border-navy-700/60 bg-navy-900 p-5">
        <span className="tracked-label text-xs text-gold-400">Explore More</span>
        <Link
          href={fallbackHref}
          className="mt-2 block font-display text-lg text-cream transition hover:text-gold-400"
        >
          {fallbackLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy-700/60 bg-navy-900 p-5">
      <span className="tracked-label text-xs text-gold-400">Nearby Localities</span>
      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex min-h-[44px] items-center rounded-lg border border-navy-700/60 px-4 text-sm text-cream transition hover:border-gold-400 hover:text-gold-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
