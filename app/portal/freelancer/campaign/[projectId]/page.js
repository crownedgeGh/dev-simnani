import { notFound } from "next/navigation";
import { PROJECTS } from "@/lib/projects";
import { CP_PROMOTION_ASSETS } from "@/lib/demoPortal";
import CampaignDetailPage from "@/components/portal/CampaignDetailPage";

export async function generateMetadata({ params }) {
  const { projectId } = await params;
  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) return { title: "Campaign Not Found | Simnani Estate" };
  return {
    title: `${project.name} Campaign | Simnani Estate`,
    description: `Campaign guidelines, video content tips and downloadable assets for ${project.name}.`,
  };
}

export default async function CampaignDetailRoute({ params }) {
  const { projectId } = await params;
  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) notFound();

  const assets = CP_PROMOTION_ASSETS.find((a) => a.projectId === projectId) || null;

  return (
    <div className="min-h-screen bg-navy-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <CampaignDetailPage
          project={project}
          assets={assets}
          backHref="/portal/freelancer?cpType=digital"
        />
      </div>
    </div>
  );
}
