export default function Stepper({ step, total, label }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="tracked-label text-xs text-muted">
          Step {step} of {total}
        </span>
        {label && <span className="tracked-label text-xs text-gold-400">{label}</span>}
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition ${
              i < step ? "bg-gold-400" : "bg-navy-700/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
