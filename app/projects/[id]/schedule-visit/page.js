import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/projects";
import ScheduleVisitForm from "@/components/property/ScheduleVisitForm";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) return {};
  return { title: `Schedule Site Visit — ${project.name} | Simnani Estate` };
}

export default async function ProjectScheduleVisitPage({ params }) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <ScheduleVisitForm title={project.name} backHref={`/projects/${project.id}`} />
    </div>
  );
}
