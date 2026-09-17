"use client";

import { useState, useSyncExternalStore } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiSun, FiMoon, FiPlusSquare, FiCheckCircle, FiX } from "react-icons/fi";
import PortalHeader from "@/components/portal/PortalHeader";
import CompanyCPDashboard from "@/components/portal/CompanyCPDashboard";
import DigitalCPDashboard from "@/components/portal/DigitalCPDashboard";
import FieldCPDashboard from "@/components/portal/FieldCPDashboard";
import CPUnderReviewModal from "@/components/portal/freelancer/CPUnderReviewModal";
import { useAuth } from "@/context/AuthContext";

let themeListeners = [];
function emitThemeChange() {
  themeListeners.forEach((listener) => listener());
}

function subscribeTheme(listener) {
  themeListeners.push(listener);
  window.addEventListener("storage", listener);
  return () => {
    themeListeners = themeListeners.filter((l) => l !== listener);
    window.removeEventListener("storage", listener);
  };
}

function getThemeSnapshot() {
  try {
    const saved = localStorage.getItem("cp_theme");
    return saved !== null ? saved : "light";
  } catch {
    return "light";
  }
}

function getThemeServerSnapshot() {
  return "light";
}

const DEMO_CP_NAMES = {
  digital: "Aarav Shah",
  field: "Rohan Mehta",
  company: "Simnani Partners Pvt. Ltd.",
};

const PORTAL_COPY = {
  company: {
    eyebrow: "Company Channel Partner Portal",
    subtitle: "Verify leads, assign Field Channel Partners and manage the network.",
  },
  digital: {
    eyebrow: "Digital Channel Partner Portal",
    subtitle: "Promote approved projects, generate leads and earn commission.",
  },
  field: {
    eyebrow: "Field Channel Partner Portal",
    subtitle: "Convert assigned leads through site visits and earn commission.",
  },
};

export default function FreelancerPortalClient({
  companyStats,
  digitalStats,
  fieldStats,
  leads,
  network,
  commissions,
  siteVisits,
  projects,
  promotionAssets,
  fieldActivity,
  digitalCampaigns,
  campaignVideos,
}) {
  const { user, isLoading, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showApprovedBanner, setShowApprovedBanner] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    await refreshUser();
    setCheckingStatus(false);
  };

  // Portal defaults to the sunlight-friendly light theme.
  // We use useSyncExternalStore to synchronize client-side localStorage
  // safely across renders without hydration mismatches or cascading effects.
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const isLight = theme === "light";

  const handleToggleTheme = () => {
    const nextTheme = isLight ? "dark" : "light";
    try {
      localStorage.setItem("cp_theme", nextTheme);
    } catch {
      // ignore storage access errors
    }
    emitThemeChange();
  };

  // Test Mode support — reads ?cpType=field|digital|company so demo dashboards
  // can be opened directly from the signup / navbar shortcuts, no form needed.
  const requestedCpType = searchParams.get("cpType");
  const isValidRequestedCp = requestedCpType && Boolean(PORTAL_COPY[requestedCpType]);

  const isRealFreelancer = user?.accountType === "freelancer";
  const cpType = isValidRequestedCp
    ? requestedCpType
    : (isRealFreelancer ? user?.cpType || "digital" : "digital");
  const partner = isValidRequestedCp
    ? { fullName: (isRealFreelancer && user?.cpType === cpType && user?.fullName) ? user.fullName : DEMO_CP_NAMES[cpType], cpType }
    : (isRealFreelancer && user ? user : { fullName: DEMO_CP_NAMES[cpType], cpType });
  const copy = PORTAL_COPY[cpType];

  // Real freelancers must be approved by an admin before their portal opens —
  // Test Mode (?cpType=...) intentionally bypasses this so demo links keep working.
  const needsApprovalGate = isRealFreelancer && !isValidRequestedCp && user?.cpApprovalStatus !== "approved";

  if (isLoading) return null;

  if (needsApprovalGate) {
    return (
      <CPUnderReviewModal
        status={user?.cpApprovalStatus || "pending"}
        onGoHome={() => router.push("/")}
        onRefresh={handleCheckStatus}
        refreshing={checkingStatus}
      />
    );
  }

  const showApproved = isRealFreelancer && !isValidRequestedCp && user?.cpApprovalStatus === "approved" && showApprovedBanner;

  return (
    <div className={`min-h-screen bg-navy-950 ${isLight ? "cp-light-theme" : ""}`}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {showApproved && (
          <div className="mb-6 flex items-start gap-3 border border-gold-500/40 bg-gold-400/5 px-4 py-3 sm:items-center">
            <FiCheckCircle className="h-5 w-5 shrink-0 text-gold-400" />
            <p className="flex-1 text-sm text-cream">
              Your profile is approved. You can start working now!
            </p>
            <button
              type="button"
              onClick={() => setShowApprovedBanner(false)}
              aria-label="Dismiss"
              className="shrink-0 text-muted transition hover:text-cream"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        )}
        <PortalHeader
          eyebrow={copy.eyebrow}
          title={`Welcome, ${partner.fullName}`}
          subtitle={copy.subtitle}
          action={
            <div className="grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-2">
              <button
                id="cp-post-property-btn"
                type="button"
                onClick={() => router.push("/post-property")}
                className="tracked-label flex h-11 w-full items-center justify-center gap-2 bg-gold-400 px-3 text-xs text-navy-950 transition hover:bg-gold-300 sm:w-auto sm:px-4"
              >
                <FiPlusSquare className="h-4 w-4 shrink-0" />
                <span>Post Property</span>
              </button>
              <button
                type="button"
                onClick={handleToggleTheme}
                aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
                className="tracked-label flex h-11 w-full items-center justify-center gap-2 border border-navy-700/60 px-3 text-xs text-cream transition hover:border-gold-400 hover:text-gold-400 sm:w-auto sm:px-4"
              >
                {isLight ? <FiMoon className="h-4 w-4 shrink-0" /> : <FiSun className="h-4 w-4 shrink-0" />}
                <span>{isLight ? "Dark Mode" : "Light Mode"}</span>
              </button>
            </div>
          }
        />
        <div className="mt-6 sm:mt-8">
          {cpType === "company" && (
            <CompanyCPDashboard
              stats={companyStats}
              leads={leads}
              network={network}
              commissions={commissions}
              projects={projects}
              fieldActivity={fieldActivity}
              digitalCampaigns={digitalCampaigns}
              campaignVideos={campaignVideos}
            />
          )}
          {cpType === "digital" && (() => {
            // Find this partner's pre-joined campaigns by name and convert to IDs
            const partnerEntry = (digitalCampaigns || []).find(
              (d) => d.partnerName === partner.fullName
            );
            const initialJoinedCampaigns = partnerEntry
              ? projects
                  .filter((p) => partnerEntry.campaigns.includes(p.name))
                  .map((p) => p.id)
              : [];
            return (
              <DigitalCPDashboard
                stats={digitalStats}
                projects={projects}
                assets={promotionAssets}
                initialJoinedCampaigns={initialJoinedCampaigns}
              />
            );
          })()}
          {cpType === "field" && (
            <FieldCPDashboard stats={fieldStats} leads={leads} siteVisits={siteVisits} projects={projects} />
          )}
        </div>
      </div>
    </div>
  );
}
