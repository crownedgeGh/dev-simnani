import ProjectGrid from "@/components/project/ProjectGrid";
import { PROJECTS } from "@/lib/projects";

export const metadata = {
  title: "Featured Developments | Simnani Estate",
  description:
    "Discover an exclusive portfolio of off-plan and newly completed luxury projects.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-cream sm:text-4xl">Featured Developments</h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Discover an exclusive portfolio of off-plan and newly completed luxury projects,
          meticulously curated for the discerning investor.
        </p>
      </div>

      <div className="mt-10">
        <ProjectGrid projects={PROJECTS} emptyMessage="No developments available right now." />
      </div>
    </div>
  );
}
