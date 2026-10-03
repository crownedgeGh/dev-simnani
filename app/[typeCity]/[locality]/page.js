import { notFound } from "next/navigation";
import {
  parseTypeCitySlug,
  slugify,
  buildTypeCitySlug,
  localitySlugToDisplayName,
  TYPE_PHRASES,
  FLAGSHIP_CITIES,
} from "@/lib/seoSlug";
import { getLocalityPageData } from "@/lib/propertiesServer";
import { getCityLocalitySlugs } from "@/lib/localityContent";
import { getSiteUrl } from "@/lib/siteUrl";
import PropertyGrid from "@/components/property/PropertyGrid";
import LocalityBreadcrumbs from "@/components/seo/LocalityBreadcrumbs";
import NearbyLocalities from "@/components/seo/NearbyLocalities";
import JsonLd from "@/components/seo/JsonLd";
import BackButton from "@/components/layout/BackButton";

export const revalidate = 60; // same ISR window as app/property/[id]/page.js

const BROWSE_ROUTE = {
  buy: "/buy",
  sell: "/sell",
  rent: "/rent",
  invest: "/invest",
  lease: "/lease",
  commercial: "/commercial",
  farming: "/farming",
  industrial: "/industrial",
  "seized-property": "/seized-property",
};

function truncate(str, max) {
  return str.length <= max ? str : `${str.slice(0, max - 1).trimEnd()}…`;
}

function buildTitle(label, locality, city) {
  const full = `${label} in ${locality}, ${city} | Simnani Estate`;
  if (full.length <= 60) return full;
  const noBrand = `${label} in ${locality}, ${city}`;
  return noBrand.length <= 60 ? noBrand : truncate(`${label} in ${locality}`, 60);
}

// ponytail: static params cover only the curated flagship localities (the
// ones we already know are eligible) for the single most common "for sale"
// phrase. Every other type-phrase/locality combination still renders via
// ISR (dynamicParams below). Upgrade to a real top-20-cities-by-listing
// aggregate query once live inventory outgrows the curated set.
export async function generateStaticParams() {
  const saleFlats = TYPE_PHRASES.find((p) => p.slug === "flats-for-sale");
  if (!saleFlats) return [];

  const params = [];
  for (const citySlug of FLAGSHIP_CITIES) {
    for (const localitySlug of getCityLocalitySlugs(citySlug)) {
      params.push({ typeCity: buildTypeCitySlug(saleFlats.slug, citySlug), locality: localitySlug });
    }
  }
  return params;
}

export const dynamicParams = true;

async function loadPageData(typeCity, locality) {
  const parsed = parseTypeCitySlug(typeCity);
  if (!parsed) return null;
  const localitySlug = slugify(locality);
  const data = await getLocalityPageData(parsed, parsed.citySlug, localitySlug);
  return { ...data, parsed, localitySlug };
}

export async function generateMetadata({ params }) {
  const { typeCity, locality } = await params;
  const data = await loadPageData(typeCity, locality);
  if (!data || !data.isEligible) return {};

  const title = buildTitle(data.parsed.label, data.localityDisplay, data.cityDisplay);
  const description = truncate(
    `Explore ${data.parsed.label.toLowerCase()} in ${data.localityDisplay}, ${data.cityDisplay}. Verified listings, price trends & locality guide on Simnani Estate.`,
    155
  );
  const url = `/${typeCity}/${locality}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Simnani Estate", type: "website" },
  };
}

export default async function LocalityPage({ params }) {
  const { typeCity, locality } = await params;
  const data = await loadPageData(typeCity, locality);

  if (!data || !data.isEligible) {
    notFound();
  }

  const { parsed, localitySlug, properties, content, cityDisplay, localityDisplay } = data;
  const cityHref = BROWSE_ROUTE[parsed.type] || "/buy";
  const pagePath = `/${typeCity}/${locality}`;
  const siteUrl = getSiteUrl();

  const nearbyLinks = getCityLocalitySlugs(parsed.citySlug)
    .filter((slug) => slug !== localitySlug)
    .map((slug) => ({
      label: `${parsed.label} in ${localitySlugToDisplayName(slug)}`,
      href: `/${buildTypeCitySlug(parsed.slug, parsed.citySlug)}/${slug}`,
    }));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: cityDisplay, item: `${siteUrl}${cityHref}` },
      { "@type": "ListItem", position: 3, name: localityDisplay, item: `${siteUrl}${pagePath}` },
    ],
  };

  const faqJsonLd =
    content?.faq?.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: content.faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />

      <div className="flex items-center gap-3">
        <BackButton href={cityHref} />
        <LocalityBreadcrumbs cityLabel={cityDisplay} cityHref={cityHref} localityLabel={localityDisplay} />
      </div>

      <h1 className="mt-4 font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
        {parsed.label} in {localityDisplay}, {cityDisplay}
      </h1>

      {content?.overview && <p className="mt-4 max-w-3xl text-sm text-muted sm:text-base">{content.overview}</p>}

      {content && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.connectivity && (
            <div className="rounded-2xl border border-navy-700/60 bg-navy-900 p-5">
              <h2 className="tracked-label text-xs text-gold-400">Connectivity</h2>
              <p className="mt-2 text-sm text-muted">{content.connectivity}</p>
            </div>
          )}
          {content.socialInfra && (
            <div className="rounded-2xl border border-navy-700/60 bg-navy-900 p-5">
              <h2 className="tracked-label text-xs text-gold-400">Social Infrastructure</h2>
              <p className="mt-2 text-sm text-muted">{content.socialInfra}</p>
            </div>
          )}
          {content.techParks && (
            <div className="rounded-2xl border border-navy-700/60 bg-navy-900 p-5">
              <h2 className="tracked-label text-xs text-gold-400">Employment Hubs</h2>
              <p className="mt-2 text-sm text-muted">{content.techParks}</p>
            </div>
          )}
        </div>
      )}

      {content?.priceTrend && (
        <div className="mt-10 rounded-2xl border border-navy-700/60 bg-navy-900 p-6">
          <h2 className="font-display text-xl text-cream sm:text-2xl">Price Trends &amp; ROI</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="tracked-label text-xs text-muted">Avg. Price / sq.ft.</p>
              <p className="mt-1 font-display text-2xl text-gold-400">
                ₹{content.priceTrend.avgPricePerSqft?.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="tracked-label text-xs text-muted">YoY Change</p>
              <p className="mt-1 font-display text-2xl text-gold-400">
                {content.priceTrend.yoyChangePercent > 0 ? "+" : ""}
                {content.priceTrend.yoyChangePercent}%
              </p>
            </div>
            {content.rentalYield && (
              <div>
                <p className="tracked-label text-xs text-muted">Rental Yield</p>
                <p className="mt-1 font-display text-2xl text-gold-400">{content.rentalYield.percent}%</p>
              </div>
            )}
          </div>
          {content.priceTrend.comparisonNote && (
            <p className="mt-4 text-sm text-muted">{content.priceTrend.comparisonNote}</p>
          )}
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-xl text-cream sm:text-2xl">
          {parsed.label} in {localityDisplay} ({properties.length})
        </h2>
        <div className="mt-6">
          <PropertyGrid
            properties={properties}
            emptyMessage={`No live listings in ${localityDisplay} right now — check back soon.`}
          />
        </div>
      </div>

      {content?.faq?.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-cream sm:text-2xl">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-4">
            {content.faq.map((item) => (
              <div key={item.q} className="rounded-2xl border border-navy-700/60 bg-navy-900 p-5">
                <h3 className="font-display text-base text-cream">{item.q}</h3>
                <p className="mt-2 text-sm text-muted">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <NearbyLocalities
          links={nearbyLinks}
          fallbackHref={cityHref}
          fallbackLabel={`Browse all ${parsed.label} in ${cityDisplay}`}
        />
      </div>
    </div>
  );
}
