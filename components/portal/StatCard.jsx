export default function StatCard({ label, value, hint }) {
  return (
    <div className="border border-navy-700/60 bg-navy-900 p-5">
      <p className="tracked-label text-xs text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl text-gold-400">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
