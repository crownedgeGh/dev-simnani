import ProjectCard from "./ProjectCard";

export default function ProjectGrid({ projects, emptyMessage }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
        <p className="text-muted">{emptyMessage || "No projects match this selection right now."}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
