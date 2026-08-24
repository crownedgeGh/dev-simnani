"use client";

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-navy-700/60 pb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`tracked-label px-4 py-2 text-xs transition ${
            active === tab.key
              ? "bg-gold-400 text-navy-950"
              : "text-muted hover:text-cream"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
