import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/propertiesServer";
import PropertyDetailContent from "@/components/property/PropertyDetailContent";
import PropertyActionCard from "@/components/property/PropertyActionCard";
import PropertyViewTracker from "@/components/property/PropertyViewTracker";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property || property.status === "Closed") return {};

  return {
    title: `${property.title} | Simnani Estate`,
    description: `${property.title} in ${property.location} — ${property.price}.`,
  };
}

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property || property.status === "Closed") {
    notFound();
  }

  return (
    <>
      <PropertyViewTracker
        id={property.id}
        title={property.title}
        price={property.price}
        type={property.type}
        location={property.location}
      />
      <PropertyDetailContent
        property={property}
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
