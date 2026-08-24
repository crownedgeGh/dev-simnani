import Image from "next/image";

const FEATURES = [
  { label: "Verified Properties", icon: <HomeCheckIcon /> },
  { label: "Best Investment Opportunities", icon: <HandCoinIcon /> },
  { label: "Personalized Support", icon: <SupportIcon /> },
  { label: "Safe & Secure Deals", icon: <ShieldIcon /> },
];

export default function Hero() {
  return (
    <section className="relative min-h-[480px] overflow-hidden sm:min-h-[560px] lg:min-h-[620px]">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/bgImage.webp"
          alt="Luxury villa at dusk"
          width={1796}
          height={876}
          priority
          quality={92}
          className="absolute right-0 top-1/2 h-auto w-[170%] max-w-none -translate-y-1/2 sm:w-[145%] lg:w-[125%]"
        />
      </div>
      <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-navy-950/75 via-navy-950/35 to-transparent sm:w-[58%]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-navy-950 to-transparent sm:h-36" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-36 pt-16 sm:px-6 sm:pb-44 lg:px-8 lg:pt-20">
        <div className="max-w-2xl">
          <span className="tracked-label inline-flex items-center gap-2 border border-gold-500/40 bg-navy-950/50 px-3 py-1.5 text-[11px] text-gold-400">
            <StarIcon />
            Luxury Real Estate
          </span>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.15] text-cream drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] sm:text-5xl md:text-6xl">
            Find a Place
            <br />
            You&apos;ll Love to
            <br />
            Call <span className="text-gold-400">Home</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm text-cream/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] sm:text-base">
            Discover premium properties, investment opportunities and trusted
            real estate services with Simnani Estate.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-5">
            {FEATURES.map((feature) => (
              <div key={feature.label} className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
                  {feature.icon}
                </span>
                <span className="text-xs leading-tight text-cream/85">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="m12 2.5 2.6 5.86 6.4.62-4.83 4.32 1.4 6.3L12 16.6l-5.57 3 1.4-6.3-4.83-4.32 6.4-.62L12 2.5Z" />
    </svg>
  );
}

function HomeCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-8.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 12.5 1.5 1.5 3-3" />
    </svg>
  );
}

function HandCoinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
      <circle cx="9" cy="7.5" r="3.25" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.75 19.5a6.25 6.25 0 0 1 12.5 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5h2.75a2 2 0 0 1 2 2v.25a2.25 2.25 0 0 1-2.25 2.25h-2M15.5 15.5h2.25a1.75 1.75 0 0 0 1.75-1.75" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
      <circle cx="12" cy="8" r="3.25" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4.5 w-4.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19 6v5.5c0 4.6-3 8.4-7 9.5-4-1.1-7-4.9-7-9.5V6l7-2.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.25 12 1.9 1.9 3.6-3.8" />
    </svg>
  );
}
