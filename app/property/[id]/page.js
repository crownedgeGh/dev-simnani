import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/propertiesServer";
import PropertyDetailContent from "@/components/property/PropertyDetailContent";
import PropertyActionCard from "@/components/property/PropertyActionCard";
import PropertyViewTracker from "@/components/property/PropertyViewTracker";
import JsonLd from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/siteUrl";

export const revalidate = 60; // cache listing HTML for 60s instead of hitting Mongo on every request

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property || property.status === "Closed") return {};

  const title = `${property.title} | Simnani Estate`;

  const specs = [
    property.beds ? `${property.beds} Bed${property.bedsPlus ? "+" : ""}` : null,
    property.baths ? `${property.baths} Bath` : null,
    property.area || null,
  ]
    .filter(Boolean)
    .join(" • ");

  const description = [
    property.price,
    property.location,
    specs || null,
    "View photos, price & contact details on Simnani Estate.",
  ]
    .filter(Boolean)
    .join(" · ");

  const rawImage = property.image || property.galleryImages?.[0];
  // Route through Next's image optimizer so WhatsApp's crawler (which doesn't
  // request webp/avif) always gets a JPEG — raw .webp uploads from R2 render
  // as a blank/broken thumbnail in WhatsApp link previews otherwise.
  const image = rawImage
    ? `/_next/image?url=${encodeURIComponent(rawImage)}&w=1200&q=75`
    : undefined;
  const url = `/property/${property.id}`;

  return {
    title,
    description,
    openGraph: {
      title: `${property.title} — ${property.price}`,
      description,
      url,
      siteName: "Simnani Estate",
      type: "website",
      images: image ? [{ url: image, alt: property.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${property.title} — ${property.price}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

function buildPropertyJsonLd(property) {
  const siteUrl = getSiteUrl();
  const rawImage = property.image || property.galleryImages?.[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description || undefined,
    url: `${siteUrl}/property/${property.id}`,
    image: rawImage || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address || property.landmark || undefined,
      addressLocality: property.locality || undefined,
      addressRegion: property.city || undefined,
      addressCountry: "IN",
    },
  };

  // Offer requires a real numeric price — never guess one out of a
  // formatted display string like "₹1.25 Cr" (see design.md Decision 5).
  if (typeof property.rawPrice === "number" && property.rawPrice > 0) {
    jsonLd.offers = {
      "@type": "Offer",
      price: property.rawPrice,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/property/${property.id}`,
    };
  }

  if (property.reraId) {
    jsonLd.additionalProperty = [
      {
        "@type": "PropertyValue",
        name: "RERA Registration ID",
        value: property.reraId,
      },
    ];
  }

  return jsonLd;
}

export default async function PropertyDetailPage({ params, searchParams }) {
  const { id } = await params;
  const { campaign } = await searchParams;
  const property = await getPropertyById(id);

  if (!property || property.status === "Closed") {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildPropertyJsonLd(property)} />
      <PropertyViewTracker
        id={property.id}
        title={property.title}
        price={property.price}
        type={property.type}
        location={property.location}
      />
      <PropertyDetailContent
        property={property}
        showDownloadButtons={campaign === "1"}
        sidebar={
          <PropertyActionCard
            propertyId={property.id}
            propertyTitle={property.title}
            propertyPrice={property.price}
            contactName={property.contact?.fullName}
            contactMobile={property.contact?.mobile}
          />
        }
      />
    </>
  );
}
