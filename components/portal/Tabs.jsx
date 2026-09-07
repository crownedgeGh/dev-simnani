"use client";

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-navy-700/60 pb-4">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            role="tab"
            aria-selected={isActive}
            className={`tracked-label inline-flex items-center justify-center border px-4 py-2 text-xs font-medium transition cursor-pointer ${
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
