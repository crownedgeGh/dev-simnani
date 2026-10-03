import { FiArrowLeft } from "react-icons/fi";

export default function Stepper({ step, total, label, onBack }) {
  return (
    <div className="mb-8">
      <div className="mb-2 grid grid-cols-3 items-center gap-3">
        <div className="flex justify-start">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-navy-700/60 text-cream transition hover:border-gold-400 hover:text-gold-400"
            >
              <FiArrowLeft className="h-4 w-4 shrink-0" />
            </button>
          )}
        </div>
        <span className="tracked-label text-center text-xs text-muted">
          Step {step} of {total}
        </span>
        <span className="tracked-label text-right text-xs text-gold-400">{label}</span>
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
