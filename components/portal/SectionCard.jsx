export default function SectionCard({ title, action, children }) {
  return (
    <div className="border border-navy-700/60 bg-navy-900">
      <div className="flex items-center justify-between border-b border-navy-700/60 px-5 py-4">
        <h2 className="tracked-label text-xs text-gold-400">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
