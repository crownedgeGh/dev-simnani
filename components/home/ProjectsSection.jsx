import Image from "next/image";
import Link from "next/link";
import { PROJECTS } from "@/lib/projects";

export default function ProjectsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-center font-display text-2xl text-cream sm:text-3xl">
        New &amp; Upcoming Projects
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group block overflow-hidden border border-navy-700/60 bg-navy-900 transition hover:border-gold-500/50"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={project.image}
                alt={project.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <h3 className="font-display text-lg text-cream transition duration-200 group-hover:text-gold-300">
                {project.name}
              </h3>
              <p className="mt-1 text-sm text-muted">{project.location}</p>
              <p className="mt-3 font-display text-lg text-gold-400">
                {project.startingPrice}
              </p>
              <p className="mt-1 text-xs text-muted">
                {project.developer} · {project.status}
              </p>
              <span className="tracked-label mt-4 inline-flex items-center gap-1 text-xs text-gold-400 transition duration-200 group-hover:text-gold-300 group-hover:translate-x-1">
                View Project →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
