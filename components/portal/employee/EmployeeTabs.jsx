"use client";

export default function EmployeeTabs({ tabs, active, onChange }) {
  return (
    <div className="-mx-4 flex overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 sm:flex-wrap sm:pb-4 gap-2 border-b border-gray-200 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                ? "border-cyan-600 bg-cyan-600 text-white shadow-sm"
                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
