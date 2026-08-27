import { MdHome, MdApartment, MdPeople, MdHandshake } from "react-icons/md";

const STATS = [
  { value: "500+", label: "Properties", sub: "Across Premium Locations", icon: <MdHome className="h-6 w-6" /> },
  { value: "50+", label: "Cities", sub: "Pan India Presence", icon: <MdApartment className="h-6 w-6" /> },
  { value: "15+", label: "Years of Trust", sub: "Delivering Excellence", icon: <MdPeople className="h-6 w-6" /> },
  { value: "1000+", label: "Happy Clients", sub: "Who Trust Us", icon: <MdHandshake className="h-6 w-6" /> },
];

export default function StatsBar() {
  return (
    <section className="bg-cream py-8 sm:py-2">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="tracked-label text-center text-xs text-gold-600">
          Why Choose Simnani Estate?
        </p>

        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4 sm:divide-x sm:divide-navy-950/10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2.5 text-center sm:px-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-950 text-gold-400">
                {stat.icon}
              </span>
              <div>
                <p className="font-display text-2xl text-navy-950 sm:text-3xl">{stat.value}</p>
                <p className="tracked-label text-xs text-navy-800">{stat.label}</p>
                <p className="mt-1 text-xs text-navy-700/70">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
