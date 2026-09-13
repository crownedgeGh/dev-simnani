import { notFound } from "next/navigation";
import { getPropertyById } from "@/lib/propertiesServer";
import ScheduleVisitForm from "@/components/property/ScheduleVisitForm";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) return {};
  return { title: `Schedule Site Visit — ${property.title} | Simnani Estate` };
}

export default async function ScheduleVisitPage({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <ScheduleVisitForm title={property.title} backHref={`/property/${property.id}`} />
    </div>
  );
}
