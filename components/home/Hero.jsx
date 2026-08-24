import Image from "next/image";

export default function Hero({ children }) {
  return (
    <section className="relative flex w-full flex-col min-h-[520px] overflow-hidden sm:min-h-[600px] lg:aspect-[1796/876] lg:max-h-[860px] lg:min-h-[700px]">
      <div className="absolute inset-0">
        <Image
          src="/bgImage.webp"
          alt="Luxury villa at dusk"
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/40 via-45% to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/45 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="max-w-2xl">
          <span className="tracked-label inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-navy-950/60 px-4 py-1.5 text-[11px] font-medium text-gold-400 backdrop-blur-sm">
            <StarIcon />
            Luxury Real Estate
          </span>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.12] text-cream drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] sm:text-5xl lg:text-[64px]">
            Find a Place
            <br />
            You&apos;ll Love to
            <br />
            Call <span className="text-gold-400">Home</span>
          </h1>
        </div>
      </div>

      <div className="relative z-20 mx-auto mt-auto w-full max-w-[1400px] px-4 pb-6 pt-12 sm:px-6 sm:pb-8 lg:px-8">
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

