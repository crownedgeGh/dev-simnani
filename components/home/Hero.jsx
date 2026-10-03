import Image from "next/image";
import { MdVerified, MdTrendingUp, MdSupportAgent, MdLock, MdStar } from "react-icons/md";

const FEATURES = [
  { title: "Verified Properties", icon: <MdVerified className="h-5 w-5" /> },
  { title: "Best Investment Opportunities", icon: <MdTrendingUp className="h-5 w-5" /> },
  { title: "Personalized Support", icon: <MdSupportAgent className="h-5 w-5" /> },
  { title: "Safe & Secure Deals", icon: <MdLock className="h-5 w-5" /> },
];

export default function Hero({ children }) {
  return (
    <section className="relative flex w-full flex-col sm:min-h-[560px] lg:min-h-[860px]">
      <div className="relative overflow-hidden sm:absolute sm:inset-0">
        <div className="relative aspect-[3/2] w-full overflow-hidden lg:absolute lg:left-1/4 lg:right-0 lg:top-0 lg:w-auto lg:rounded-tl-[3.5rem] lg:rounded-bl-[3.5rem] lg:bg-navy-950 lg:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
          <Image
            src="/useThis.png"
            alt="Luxury villa at dusk"
            fill
            priority
            quality={92}
            sizes="100vw"
            className="object-cover object-top"
          />
        </div>


        <div className="pointer-events-none absolute -left-32 top-1/4 hidden h-[420px] w-[420px] rounded-full bg-gold-500/10 blur-[120px] lg:block" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 hidden h-[320px] w-[320px] rounded-full bg-gold-600/10 blur-[110px] lg:block" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pt-0 sm:px-6 sm:pt-16 lg:absolute lg:inset-0 lg:mx-0 lg:flex lg:max-w-none lg:items-start lg:px-0 lg:pt-0">
        {/* lg+: fixed at exactly the left 25% of the section, matching the image's lg:left-1/4 start, so text can never sit under the photo at any desktop width */}
        <div className="max-w-2xl lg:w-1/4 lg:max-w-none lg:pl-8 lg:pr-4 lg:pt-16">

          <h1 className="hidden font-display font-semibold leading-[1.15] text-cream drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] lg:mt-6 lg:block lg:text-[clamp(1.5rem,3.4vw,4.25rem)]">
            Find a Place
            <br />
            You&apos;ll Love to
            <br />
            Call <span className="text-gold-400">Home</span>
          </h1>



          <div className="mt-8 hidden max-w-sm grid-cols-2 gap-x-6 gap-y-5 lg:grid lg:max-w-full lg:grid-cols-1 lg:gap-y-4">
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

      <div className="relative z-20 mx-auto w-full max-w-[1400px] px-4 pb-10 pt-4 sm:mt-auto sm:px-6 sm:pb-8 sm:pt-12 lg:px-8">
        {children}
      </div>
    </section>
  );
}
