"use client";

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="-mx-4 flex overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 sm:flex-wrap sm:pb-4 gap-2 border-b border-navy-700/60 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            role="tab"
            aria-selected={isActive}
            className={`tracked-label inline-flex shrink-0 items-center justify-center border px-4 py-2.5 sm:py-2 text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              isActive
                ? "border-gold-400 bg-gold-400 text-navy-950 shadow-sm"
                : "border-navy-700/70 bg-navy-900/80 text-muted hover:border-gold-400/60 hover:bg-navy-800 hover:text-cream"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
