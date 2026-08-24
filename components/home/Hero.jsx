import Image from "next/image";
import SearchBar from "@/components/home/SearchBar";

const STATS = [
  { value: "500+", label: "Properties" },
  { value: "50+", label: "Cities" },
  { value: "15+", label: "Years of Trust" },
];

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=2000&q=80&auto=format&fit=crop"
        alt="Modern estate at dusk"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-navy-950 via-navy-950/55 to-transparent" />

      <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center gap-8 px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="max-w-2xl border border-white/10 bg-navy-950/50 p-6 backdrop-blur-md sm:p-8">
          <p className="tracked-label text-xs text-gold-400">Luxury Real Estate</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-cream sm:text-4xl md:text-5xl">
            Find a Place You&apos;ll Love to Call <span className="text-gold-400">Home</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-cream/80 sm:text-base">
            Discover properties, investment opportunities and trusted real estate
            services with Simnani Estate.
          </p>
        </div>

        <div className="w-full max-w-5xl">
          <SearchBar />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl text-gold-400">{stat.value}</p>
                <p className="tracked-label text-[10px] text-cream/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
