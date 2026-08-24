const TONES = {
  gold: "border-gold-400/60 bg-gold-400/10 text-gold-400",
  success: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  error: "border-red-500/50 bg-red-500/10 text-red-400",
  muted: "border-navy-700/60 bg-navy-900 text-muted",
};

export default function Badge({ children, tone = "muted", dot = false }) {
  return (
    <span
      className={`tracked-label inline-flex items-center gap-1.5 border px-3 py-1 text-[10px] ${TONES[tone]}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
