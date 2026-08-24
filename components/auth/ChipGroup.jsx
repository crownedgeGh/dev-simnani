export default function ChipGroup({ options, value, onChange, multi = false, layout = "pill" }) {
  function isSelected(val) {
    return multi ? value.includes(val) : value === val;
  }

  function handleClick(val) {
    if (multi) {
      onChange(isSelected(val) ? value.filter((v) => v !== val) : [...value, val]);
    } else {
      onChange(val);
    }
  }

  if (layout === "row") {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleClick(opt.value)}
            aria-pressed={isSelected(opt.value)}
            className={`flex items-center justify-between border px-4 py-3 text-left text-sm transition ${
              isSelected(opt.value)
                ? "border-gold-400 text-cream"
                : "border-navy-700/60 text-muted hover:text-cream"
            }`}
          >
            {opt.label}
            {isSelected(opt.value) && <span className="text-gold-400">✓</span>}
          </button>
        ))}
      </div>
    );
  }

  if (layout === "card") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleClick(opt.value)}
            aria-pressed={isSelected(opt.value)}
            className={`flex flex-col items-start gap-1 border p-4 text-left transition ${
              isSelected(opt.value)
                ? "border-gold-400 bg-gold-400/5"
                : "border-navy-700/60 hover:border-navy-600"
            }`}
          >
            <span className="text-sm text-cream">{opt.label}</span>
            {opt.hint && <span className="text-xs text-muted">{opt.hint}</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handleClick(opt.value)}
          aria-pressed={isSelected(opt.value)}
          className={`tracked-label rounded-sm border px-4 py-2 text-xs transition ${
            isSelected(opt.value)
              ? "border-gold-400 bg-gold-400 text-navy-950"
              : "border-navy-700/60 text-muted hover:text-cream"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
