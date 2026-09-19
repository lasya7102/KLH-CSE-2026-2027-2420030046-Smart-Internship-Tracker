export default function SkillDemandBar({ skill, count, max, have }) {
  const width = Math.max(8, Math.round((count / max) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className={`font-medium ${have ? "text-muted" : "text-ink"}`}>
          {skill} {have && <span className="text-growth">✓</span>}
        </span>
        <span className="font-mono-num text-xs text-muted">{count} internships</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-line/60">
        <div
          className={`h-full rounded-full ${have ? "bg-line" : "bg-brand"}`}
          style={{ width: `${width}%`, transition: "width 600ms ease-out" }}
        />
      </div>
    </div>
  );
}
