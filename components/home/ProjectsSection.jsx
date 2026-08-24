import Image from "next/image";
import { PROJECTS } from "@/lib/projects";

export default function ProjectsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-center font-display text-2xl text-cream sm:text-3xl">
        New &amp; Upcoming Projects
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => (
          <div
            key={project.id}
            className="overflow-hidden border border-navy-700/60 bg-navy-900 transition hover:border-gold-500/50"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={project.image}
                alt={project.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="font-display text-lg text-cream">
                {project.name}
              </h3>
              <p className="mt-1 text-sm text-muted">{project.location}</p>
              <p className="mt-3 font-display text-lg text-gold-400">
                {project.startingPrice}
              </p>
              <p className="mt-1 text-xs text-muted">
                {project.developer} · {project.status}
              </p>
              <button
                type="button"
                className="tracked-label mt-4 text-xs text-gold-400 transition hover:text-gold-300"
              >
                View Project →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
