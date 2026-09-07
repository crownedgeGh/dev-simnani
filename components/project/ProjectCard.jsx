import Image from "next/image";
import Link from "next/link";

export default function ProjectCard({ project }) {
  const { id, name, location, startingPrice, developer, status, image } = project;

  return (
    <Link
      href={`/projects/${id}`}
      className="group block overflow-hidden border border-navy-700/60 bg-navy-900 transition hover:border-gold-500/50"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="tracked-label absolute left-3 top-3 bg-gold-500 px-2 py-1 text-[10px] font-semibold text-navy-950">
          {status}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg text-cream transition duration-200 group-hover:text-gold-300">{name}</h3>
        <p className="mt-1 text-sm text-muted">{location}</p>
        <p className="mt-1 text-xs text-muted">by {developer}</p>
        <p className="mt-3 font-display text-xl text-gold-400">{startingPrice}</p>

        <span
          className="tracked-label mt-5 block w-full border border-gold-500/70 py-2.5 text-center text-xs text-gold-400 transition group-hover:bg-gold-500 group-hover:text-navy-950"
        >
          View Project
        </span>
      </div>
    </Link>
  );
}
