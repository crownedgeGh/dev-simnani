import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/projects";
import EnquiryForm from "@/components/property/EnquiryForm";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) return {};
  return { title: `Enquire — ${project.name} | Simnani Estate` };
}

export default async function ProjectEnquirePage({ params }) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <EnquiryForm title={project.name} backHref={`/projects/${project.id}`} />
    </div>
  );
}
