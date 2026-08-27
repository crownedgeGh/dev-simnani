export default function PortalHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-4 border-b border-navy-700/60 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="tracked-label text-xs text-gold-400">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
