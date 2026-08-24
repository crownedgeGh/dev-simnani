export default function Switch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
        checked ? "border-gold-400 bg-gold-400" : "border-navy-700/60 bg-navy-950"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-navy-950 transition ${
          checked ? "left-[22px] bg-navy-950" : "left-0.5 bg-cream"
        }`}
      />
    </button>
  );
}
