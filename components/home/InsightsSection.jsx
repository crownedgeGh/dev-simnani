const INSIGHTS = [
  {
    category: "Buying Guide",
    title: "A Complete Guide to Buying Your First Home",
    excerpt:
      "Everything first-time buyers need to know before signing the dotted line.",
  },
  {
    category: "Investment",
    title: "5 Emerging Localities for Real Estate Investment",
    excerpt: "Where smart money is moving across India's growth corridors.",
  },
  {
    category: "Market Trends",
    title: "Property Prices: What to Expect in 2026",
    excerpt:
      "A data-backed look at pricing trends across major Indian cities.",
  },
];

export default function InsightsSection() {
  return (
    <section className="bg-navy-900/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-2xl text-cream sm:text-3xl">
          Real Estate Insights
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INSIGHTS.map((insight) => (
            <div
              key={insight.title}
              className="border border-navy-700/60 bg-navy-950 p-6 transition hover:border-gold-500/50"
            >
              <p className="tracked-label text-[10px] text-gold-400">
                {insight.category}
              </p>
              <h3 className="mt-3 font-display text-lg text-cream">
                {insight.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{insight.excerpt}</p>
              <button
                type="button"
                className="tracked-label mt-5 text-xs text-gold-400 transition hover:text-gold-300"
              >
                Read More →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
