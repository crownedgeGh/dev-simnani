import Image from "next/image";

const FEATURES = [
  { title: "Verified Properties", icon: <ShieldCheckIcon /> },
  { title: "Best Investment Opportunities", icon: <TrendUpIcon /> },
  { title: "Personalized Support", icon: <SupportIcon /> },
  { title: "Safe & Secure Deals", icon: <LockIcon /> },
];

export default function Hero({ children }) {
  return (
    <section className="relative flex w-full flex-col min-h-[480px] overflow-hidden sm:min-h-[560px] lg:min-h-[860px]">
      <div className="relative aspect-[3/2] w-full overflow-hidden lg:absolute lg:left-1/4 lg:right-0 lg:top-0 lg:w-auto lg:rounded-bl-[3.5rem] lg:bg-navy-950 lg:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        <Image
          src="/useThis.png"
          alt="Luxury villa at dusk"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-bottom"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-navy-950 to-transparent lg:hidden" />
      </div>

      <div className="absolute inset-0 hidden bg-gradient-to-r from-navy-950/85 via-navy-950/40 via-45% to-transparent lg:block" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/55 via-transparent to-navy-950/40 lg:to-transparent" />

      <div className="pointer-events-none absolute -left-32 top-1/4 hidden h-[420px] w-[420px] rounded-full bg-gold-500/10 blur-[120px] lg:block" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 hidden h-[320px] w-[320px] rounded-full bg-gold-600/10 blur-[110px] lg:block" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pt-24">
        <div className="max-w-2xl">
          <span className="tracked-label inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-navy-950/60 px-4 py-1.5 text-[11px] font-medium text-gold-400 backdrop-blur-sm">
            <StarIcon />
            Luxury Real Estate
          </span>

          <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.15] text-cream drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] sm:mt-6 sm:text-5xl lg:text-[64px]">
            Find a Place
            <br />
            You&apos;ll Love to
            <br />
            Call <span className="text-gold-400">Home</span>
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/75 sm:mt-5 sm:text-base">
            Discover premium properties, investment opportunities and trusted
            real estate services with Simnani Estate.
          </p>

          <div className="mt-8 hidden max-w-sm grid-cols-2 gap-x-6 gap-y-5 lg:grid">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-navy-950/60 text-gold-400 backdrop-blur-sm">
                  {feature.icon}
                </span>
                <span className="text-xs font-medium leading-tight text-cream/90 sm:text-sm">
                  {feature.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto mt-auto w-full max-w-[1400px] px-4 pb-6 pt-10 sm:px-6 sm:pb-8 sm:pt-12 lg:px-8">
        {children}
      </div>
    </section>
  );
}

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.6 5.86 6.4.62-4.83 4.32 1.4 6.3L12 17.1l-5.57 3 1.4-6.3-4.83-4.32 6.4-.62L12 3Z" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M12 3l7.5 3.75v4.5c0 4.64-3.2 8.98-7.5 10.5-4.3-1.52-7.5-5.86-7.5-10.5v-4.5L12 3Z" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15.75 8.25 10.5l3.75 3.75L21 5.25M21 5.25h-5.25M21 5.25v5.25" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.75c-1.5-1.32-2.25-2.7-2.25-4.5a6 6 0 1 1 12 0c0 1.8-.75 3.18-2.25 4.5M9.75 18.75h4.5M10.5 21.75h3" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 10.5V7.5a5.25 5.25 0 0 1 10.5 0v3M5.25 10.5h13.5A1.5 1.5 0 0 1 20.25 12v7.5a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  );
}

