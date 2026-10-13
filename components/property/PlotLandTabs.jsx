"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PropertyFilterBar from "./PropertyFilterBar";

const TABS = [
  { key: "buy", label: "Buy", purpose: "sale", pricingMode: "sale" },
  { key: "rent", label: "Rent", purpose: "rent", pricingMode: "rent" },
  { key: "lease", label: "Lease", purpose: "lease", pricingMode: "rent" },
];

export default function PlotLandTabs(props) {
  return (
    <Suspense fallback={null}>
      <PlotLandTabsInner {...props} />
    </Suspense>
  );
}

function PlotLandTabsInner({ properties }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeKey = TABS.some((t) => t.key === searchParams.get("purpose"))
    ? searchParams.get("purpose")
    : "buy";
  const activeTab = TABS.find((t) => t.key === activeKey);

  function selectTab(key) {
    if (key === activeKey) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("purpose", key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const filteredProperties = useMemo(
    () => properties.filter((p) => (p.purpose || "sale").toLowerCase() === activeTab.purpose),
    [properties, activeTab]
  );

  return (
    <div>
      <div className="flex w-full gap-2 rounded-full border border-navy-700/60 bg-navy-900 p-1.5 sm:inline-flex sm:w-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => selectTab(tab.key)}
            className={`tracked-label flex-1 rounded-full px-4 py-3 text-xs transition sm:flex-none sm:px-6 ${
              activeKey === tab.key
                ? "bg-gold-400 text-navy-950"
                : "text-muted hover:text-cream"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <PropertyFilterBar
          properties={filteredProperties}
          pricingMode={activeTab.pricingMode}
          showPropertyType={false}
          emptyMessage={`No plots or land listed for ${activeTab.label.toLowerCase()} right now. Check back soon.`}
        />
      </div>
    </div>
  );
}
