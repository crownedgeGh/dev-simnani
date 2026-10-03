import { getSiteUrl } from "@/lib/siteUrl";
import { getAllProperties, getLocalityPageData } from "@/lib/propertiesServer";
import { TYPE_PHRASES, FLAGSHIP_CITIES, buildTypeCitySlug } from "@/lib/seoSlug";
import { getCityLocalitySlugs } from "@/lib/localityContent";

export const revalidate = 3600;

const STATIC_ROUTES = [
  "/",
  "/buy",
  "/rent",
  "/sell",
  "/invest",
  "/commercial",
  "/farming",
  "/industrial",
  "/lease",
  "/projects",
  "/help",
  "/request-callback",
  "/guides/rera-buyer-checklist",
];

// ponytail: locality-page eligibility is only checked across the curated
// flagship city/locality set (small, bounded — see FLAGSHIP_CITIES), not
// all 100+ cities x 2,000+ localities x type-phrases. That full sweep is
// exactly the thin-content-at-scale problem design.md's Non-Goals rules
// out; expand the source list here as curated content grows, and split
// into generateSitemaps() chunks only once entry count needs it.
export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const entries = STATIC_ROUTES.map((route) => ({ url: `${siteUrl}${route}`, lastModified: new Date() }));

  const properties = await getAllProperties();
  for (const property of properties) {
    if (property.status === "Closed") continue;
    entries.push({ url: `${siteUrl}/property/${property.id}`, lastModified: new Date() });
  }

  for (const citySlug of FLAGSHIP_CITIES) {
    for (const localitySlug of getCityLocalitySlugs(citySlug)) {
      for (const phrase of TYPE_PHRASES) {
        const data = await getLocalityPageData(phrase, citySlug, localitySlug);
        if (data.isEligible) {
          entries.push({
            url: `${siteUrl}/${buildTypeCitySlug(phrase.slug, citySlug)}/${localitySlug}`,
            lastModified: new Date(),
          });
        }
      }
    }
  }

  return entries;
}
