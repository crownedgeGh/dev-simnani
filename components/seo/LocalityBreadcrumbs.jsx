import Link from "next/link";
import { MdChevronRight } from "react-icons/md";

/**
 * National -> City -> Locality breadcrumb trail for SEO locality pages.
 * `cityHref` points at the city-agnostic browse route (e.g. /buy) since
 * there is no standalone city-level listing page.
 */
export default function LocalityBreadcrumbs({ cityLabel, cityHref, localityLabel }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted">
      <Link href="/" className="tracked-label transition hover:text-gold-400">
        Home
      </Link>
      <MdChevronRight className="h-3.5 w-3.5 shrink-0" />
      <Link href={cityHref} className="tracked-label transition hover:text-gold-400">
        {cityLabel}
      </Link>
      <MdChevronRight className="h-3.5 w-3.5 shrink-0" />
      <span className="tracked-label text-cream">{localityLabel}</span>
    </nav>
  );
}
