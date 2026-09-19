export default function StatCard({ label, value, icon: Icon, accent = "brand" }) {
  const accents = {
    brand: "bg-brand-soft text-brand",
    growth: "bg-growth-soft text-growth",
    caution: "bg-caution-soft text-caution",
    alert: "bg-alert-soft text-alert",
    ink: "bg-ink/5 text-ink",
  };
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accents[accent]}`}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div>
        <p className="font-mono-num text-2xl font-semibold text-ink leading-none">{value}</p>
        <p className="mt-1.5 text-xs font-medium text-muted">{label}</p>
      </div>
    </div>
  );
}
