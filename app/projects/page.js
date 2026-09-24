import ProjectFilterBar from "@/components/project/ProjectFilterBar";
import { PROJECTS } from "@/lib/projects";
import BackButton from "@/components/layout/BackButton";

export const metadata = {
  title: "Featured Developments | Simnani Estate",
  description:
    "Discover an exclusive portfolio of off-plan and newly completed luxury projects.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 max-w-2xl">
        <BackButton />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">Company Projects</h1>
      </div>

      <div className="mt-10">
        <ProjectFilterBar projects={PROJECTS} emptyMessage="No developments available right now." />
      </div>
    </div>
  );
}
