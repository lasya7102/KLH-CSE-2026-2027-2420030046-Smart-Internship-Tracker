import { Check, X, Clock } from "lucide-react";

/**
 * status: "have" | "missing" | "learning"
 */
export default function SkillBadge({ skill, status = "have", onRemove, size = "md" }) {
  const styles = {
    have: "bg-growth-soft text-growth border-transparent",
    missing: "bg-alert-soft text-alert border-transparent",
    learning: "bg-caution-soft text-caution border-transparent",
  };
  const Icon = status === "have" ? Check : status === "learning" ? Clock : X;
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${styles[status]} ${pad}`}
    >
      <Icon size={size === "sm" ? 12 : 14} strokeWidth={2.5} />
      {skill}
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          aria-label={`Remove ${skill}`}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10"
        >
          <X size={11} strokeWidth={3} />
        </button>
      )}
    </span>
  );
}
