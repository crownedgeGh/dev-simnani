"use client";

export default function EmployeeTabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
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
