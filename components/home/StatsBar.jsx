const STATS = [
  { value: "500+", label: "Properties", sub: "Across Premium Locations", icon: <HomeIcon /> },
  { value: "50+", label: "Cities", sub: "Pan India Presence", icon: <BuildingIcon /> },
  { value: "15+", label: "Years of Trust", sub: "Delivering Excellence", icon: <UsersIcon /> },
  { value: "1000+", label: "Happy Clients", sub: "Who Trust Us", icon: <HandshakeIcon /> },
];

export default function StatsBar() {
  return (
    <section className="bg-cream py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="tracked-label text-center text-xs text-gold-600">
          Why Choose Simnani Estate?
        </p>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:divide-x sm:divide-navy-950/10">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-3 text-center sm:px-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-950 text-gold-400">
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

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-8.5Z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 21V5.25A1.5 1.5 0 0 1 6 3.75h7.5a1.5 1.5 0 0 1 1.5 1.5V21M4.5 21h13.5M19.5 21v-9a1.5 1.5 0 0 0-1.5-1.5h-3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7.5h1.5M8 11h1.5M8 14.5h1.5M12 7.5h1.5M12 11h1.5M12 14.5h1.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
      <circle cx="9" cy="8" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.75 19.5a6.25 6.25 0 0 1 12.5 0M15.5 8.25a2.75 2.75 0 0 1 0 5.4M18.25 19.5a5.5 5.5 0 0 0-4.4-5.4" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.75 12 3.5-3.5a2 2 0 0 1 2.83 0L11 10.42M21.25 12l-3.5-3.5a2 2 0 0 0-2.83 0L11 12.42" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 12.5 2.4 2.4a1.6 1.6 0 0 0 2.27 0 1.6 1.6 0 0 0 0-2.27L11 11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 15 1.15 1.15a1.6 1.6 0 0 0 2.27 0 1.6 1.6 0 0 0 0-2.27M13 12.5l1.65 1.65a1.6 1.6 0 0 0 2.27 0 1.6 1.6 0 0 0 0-2.27L14.5 9.5" />
    </svg>
  );
}
