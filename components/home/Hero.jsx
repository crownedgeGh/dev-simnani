import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=2000&q=80&auto=format&fit=crop"
        alt="Modern estate at dusk"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/60 to-navy-950" />

      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl md:text-6xl">
          Find a Place You&apos;ll Love to Call{" "}
          <span className="text-gold-400">Home</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-cream/80 sm:text-lg">
          Discover properties, investment opportunities and trusted real
          estate services with Simnani Estate.
        </p>
        <div className="mt-10">
          <Link
            href="#explore"
            className="tracked-label inline-block bg-gold-500 px-8 py-3.5 text-sm font-semibold text-navy-950 transition hover:bg-gold-400"
          >
            Explore Simnani Estate
          </Link>
        </div>
      </div>
    </section>
  );
}
