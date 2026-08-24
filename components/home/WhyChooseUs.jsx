const VALUES = [
  {
    title: "Verified Properties",
    description: "Discover genuine property listings.",
    icon: "M9 12.75 11.25 15 15 9.75M12 3l7.5 3.75v4.5c0 4.64-3.2 8.98-7.5 10.5-4.3-1.52-7.5-5.86-7.5-10.5v-4.5L12 3Z",
  },
  {
    title: "Trusted Sellers",
    description: "Connect with verified owners and professionals.",
    icon: "M15 19.5 21 15M12 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1.5 12.5H3v-1.25A5.25 5.25 0 0 1 8.25 12h.5a5.24 5.24 0 0 1 3.02.96",
  },
  {
    title: "Smart Investment",
    description: "Find opportunities suited to your budget.",
    icon: "M3 15.75 8.25 10.5l3.75 3.75L21 5.25M21 5.25h-5.25M21 5.25v5.25",
  },
  {
    title: "End-to-End Support",
    description: "Get support throughout your property journey.",
    icon: "M8.25 15.75c-1.5-1.32-2.25-2.7-2.25-4.5a6 6 0 1 1 12 0c0 1.8-.75 3.18-2.25 4.5M9.75 18.75h4.5M10.5 21.75h3",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-center font-display text-2xl text-cream sm:text-3xl">
        What Sets Us <span className="text-gold-400">Apart</span>
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((value) => (
          <div key={value.title} className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/50 text-gold-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={value.icon} />
              </svg>
            </span>
            <h3 className="mt-4 font-display text-base text-cream">
              {value.title}
            </h3>
            <p className="mt-2 text-sm text-muted">{value.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
