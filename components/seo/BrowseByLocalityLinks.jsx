import Link from "next/link";
import { buildTypeCitySlug, getCityDisplayName, localitySlugToDisplayName, FLAGSHIP_CITIES } from "@/lib/seoSlug";
import { getCityLocalitySlugs } from "@/lib/localityContent";

/**
 * Internal-linking entry point from the city-agnostic browse pages
 * (/buy, /rent, /sell, /invest) into the SEO locality landing pages —
 * without this, the new locality pages have no inbound links from the
 * site's main navigation paths.
 */
export default function BrowseByLocalityLinks({ phraseSlug, title }) {
  const links = FLAGSHIP_CITIES.flatMap((citySlug) =>
    getCityLocalitySlugs(citySlug).map((localitySlug) => ({
      href: `/${buildTypeCitySlug(phraseSlug, citySlug)}/${localitySlug}`,
      label: `${localitySlugToDisplayName(localitySlug)}, ${getCityDisplayName(citySlug)}`,
    }))
  );

  if (links.length === 0) return null;

  return (
    <div className="mt-10 border-t border-navy-800 pt-8">
      <span className="tracked-label text-xs text-gold-400">{title || "Browse by Locality"}</span>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="tracked-label flex min-h-[44px] items-center rounded-full border border-navy-700/60 px-4 text-xs text-muted transition hover:border-gold-400 hover:text-gold-400"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
