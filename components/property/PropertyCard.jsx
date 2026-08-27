import Image from "next/image";
import Link from "next/link";
import { MdFavorite, MdBed, MdBathtub, MdSquareFoot } from "react-icons/md";

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
          <MdFavorite className="h-4 w-4" />
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
              {beds && (
                <span className="flex items-center gap-1">
                  <MdBed className="h-3.5 w-3.5 shrink-0" />
                  {beds} Beds
                </span>
              )}
              {baths && (
                <span className="flex items-center gap-1">
                  <MdBathtub className="h-3.5 w-3.5 shrink-0" />
                  {baths} Baths
                </span>
              )}
              <span className="flex items-center gap-1">
                <MdSquareFoot className="h-3.5 w-3.5 shrink-0" />
                {area}
              </span>
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
