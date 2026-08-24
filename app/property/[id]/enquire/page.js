import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/properties";
import EnquiryForm from "@/components/property/EnquiryForm";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = getPropertyById(id);
  if (!property) return {};
  return { title: `Enquire — ${property.title} | Simnani Estate` };
}

export default async function PropertyEnquirePage({ params }) {
  const { id } = await params;
  const property = getPropertyById(id);
  if (!property) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <EnquiryForm title={property.title} backHref={`/property/${property.id}`} />
    </div>
  );
}
