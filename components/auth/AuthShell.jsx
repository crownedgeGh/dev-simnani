const MAX_WIDTH = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export default function AuthShell({ children, size = "md" }) {
  return (
    <div
      className={`w-full ${MAX_WIDTH[size] || MAX_WIDTH.md} border border-navy-700/60 bg-navy-900 p-8 shadow-2xl sm:p-10`}
    >
      {children}
    </div>
  );
}
