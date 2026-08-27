const TONES = {
  solid: "border-cyan-600 bg-cyan-600 text-white",
  accent: "border-cyan-400 bg-cyan-50 text-cyan-700",
  neutral: "border-gray-200 bg-gray-50 text-gray-500",
};

export default function EmployeeBadge({ children, tone = "neutral" }) {
  return (
    <span
      className={`tracked-label inline-flex items-center gap-1.5 border px-3 py-1 text-[10px] ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
