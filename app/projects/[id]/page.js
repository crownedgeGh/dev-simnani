import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/projects";
import { AMENITIES, getProjectDescription } from "@/lib/propertyContent";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) return {};

  return {
    title: `${project.name} | Simnani Estate`,
    description: `${project.name} in ${project.location} — ${project.startingPrice}.`,
  };
}

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative aspect-[16/9] w-full overflow-hidden border border-navy-700/60">
        <Image
          src={project.image}
          alt={project.name}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <span className="tracked-label absolute left-4 top-4 bg-gold-500 px-3 py-1.5 text-[10px] font-semibold text-navy-950">
          {project.status}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="tracked-label text-xs text-gold-400">Verified Project</p>
          <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl">{project.name}</h1>
          <p className="mt-2 text-sm text-muted">{project.location}</p>
          <p className="mt-4 font-display text-2xl text-gold-400">{project.startingPrice}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-y border-navy-700/60 py-6 sm:grid-cols-3">
            <Stat label="Developer" value={project.developer} />
            <Stat label="Status" value={project.status} />
            <Stat label="Location" value={project.location} />
          </div>

          <section className="mt-10">
            <h2 className="font-display text-xl text-cream">Project Overview</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {getProjectDescription(project)}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl text-cream">Premium Amenities</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => (
                <span
                  key={amenity}
                  className="tracked-label border border-navy-700/60 px-3 py-2 text-xs text-cream/80"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="border border-navy-700/60 bg-navy-900 p-6 lg:sticky lg:top-24">
            <h3 className="font-display text-lg text-cream">Interested in this project?</h3>
            <p className="mt-2 text-sm text-muted">
              Speak with our investment advisory team to learn more.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href={`/projects/${project.id}/enquire`}
                className="tracked-label bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
              >
                Enquire Now
              </Link>
              <Link
                href={`/projects/${project.id}/schedule-visit`}
                className="tracked-label border border-navy-700/60 px-6 py-4 text-center text-xs text-cream transition hover:border-gold-400"
              >
                Schedule Site Visit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="font-display text-base text-cream">{value}</p>
      <p className="tracked-label mt-1 text-[10px] text-muted">{label}</p>
    </div>
  );
}
