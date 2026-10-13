import BackButton from "@/components/layout/BackButton";

const MAX_WIDTH = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

// Every auth/registration card gets a back button in the same spot — pass
// `onBack` to intercept it (e.g. step back inside a wizard instead of leaving).
export default function AuthShell({ children, size = "md", onBack }) {
  return (
    <div
      className={`w-full ${MAX_WIDTH[size] || MAX_WIDTH.md} rounded-3xl border border-navy-700/60 bg-navy-900 p-6 shadow-2xl sm:p-10`}
    >
      <BackButton onClick={onBack} className="mb-4" />
      {children}
    </div>
  );
}
