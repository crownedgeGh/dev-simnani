import { MdHome, MdApartment, MdPeople, MdVerifiedUser } from "react-icons/md";

const STATS = [
  { value: "5000+", label: "Properties", sub: "Across Premium Locations", icon: <MdHome className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: "50+", label: "Cities", sub: "Pan India Presence", icon: <MdApartment className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: "10+", label: "Years of Trust", sub: "Delivering Excellence", icon: <MdPeople className="h-5 w-5 sm:h-6 sm:w-6" /> },
  { value: "100%", label: "Transparency", sub: "Legal Assurance", icon: <MdVerifiedUser className="h-5 w-5 sm:h-6 sm:w-6" /> },
];

export default function StatsBar() {
  return (
    <section className="bg-cream py-8 sm:py-2">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="tracked-label text-center text-[11px] text-gold-600 sm:text-xs">
          Why Choose Simnani Estate?
        </p>

        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 sm:mt-5 sm:gap-x-6 sm:gap-y-7 sm:grid-cols-4 sm:divide-x sm:divide-navy-950/10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1.5 text-center sm:gap-2.5 sm:px-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-950 text-gold-400 sm:h-11 sm:w-11">
                {stat.icon}
              </span>
              <div>
                <p className="font-display text-xl text-navy-950 sm:text-3xl">{stat.value}</p>
                <p className="tracked-label text-[10px] text-navy-800 sm:text-xs">{stat.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-navy-700/70 sm:mt-1 sm:text-xs">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
