import Image from "next/image";
import Link from "next/link";

export default function PropertyCard({ property }) {
  const { id, title, price, location, image, badge, beds, baths, area, roi, type } =
    property;
  const isInvest = type === "invest";

  return (
    <div className="group overflow-hidden rounded-sm border border-navy-700/60 bg-navy-900 transition hover:border-gold-500/50">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className="tracked-label absolute left-3 top-3 rounded-sm bg-gold-500 px-2 py-1 text-[10px] font-semibold text-navy-950">
            {badge}
          </span>
        )}
        <button
          type="button"
          aria-label="Save property"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-navy-950/70 text-cream transition hover:text-gold-400"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25s-7.5-4.55-9.62-8.65C.86 8.36 2.2 5 5.5 5c1.86 0 3.41 1.1 4.13 2.68a1 1 0 0 0 1.74 0C12.09 6.1 13.64 5 15.5 5c3.3 0 4.64 3.36 3.12 6.6C19.5 15.7 12 20.25 12 20.25Z"
            />
          </svg>
        </button>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg text-cream">{title}</h3>
        <p className="mt-1 text-sm text-muted">{location}</p>
        <p className="mt-3 font-display text-xl text-gold-400">{price}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted">
          {isInvest ? (
            <span>{roi}</span>
          ) : (
            <>
              {beds && <span>{beds} Beds</span>}
              {baths && <span>{baths} Baths</span>}
              <span>{area}</span>
            </>
          )}
        </div>

        <Link
          href={`/property/${id}`}
          className="tracked-label mt-5 block w-full border border-gold-500/70 py-2.5 text-center text-xs text-gold-400 transition hover:bg-gold-500 hover:text-navy-950"
        >
          {isInvest ? "View Opportunity" : "View Details"}
        </Link>
      </div>
    </div>
  );
}
