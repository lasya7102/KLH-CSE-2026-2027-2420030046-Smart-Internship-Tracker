const STATUS_STYLES = {
  Applied: "bg-brand-soft text-brand",
  "OA Pending": "bg-caution-soft text-caution",
  Interview: "bg-caution-soft text-caution",
  Selected: "bg-growth-soft text-growth",
  Rejected: "bg-alert-soft text-alert",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] || "bg-line text-muted"
      }`}
    >
      {status}
    </span>
  );
}
