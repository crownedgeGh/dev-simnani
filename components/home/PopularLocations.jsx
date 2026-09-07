import Image from "next/image";
import Link from "next/link";
import { LOCATIONS } from "@/lib/locations";

export default function PopularLocations() {
  return (
    <section className="bg-navy-900/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-2xl text-cream sm:text-3xl">
          Explore Popular Locations
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {LOCATIONS.map((location) => (
            <Link
              key={location.city}
              href={`/buy?location=${encodeURIComponent(location.city)}`}
              className="group relative aspect-square overflow-hidden border border-transparent transition duration-300 hover:border-gold-500/40"
            >
              <Image
                src={location.image}
                alt={location.city}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="font-display text-base text-cream transition duration-200 group-hover:text-gold-300">
                  {location.city}
                </p>
                <p className="text-xs text-gold-400">
                  {location.propertyCount}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
