import { useState } from "react";
import { Building2, Sparkles, Check } from "lucide-react";
import SkillBadge from "./SkillBadge";
import { useApp } from "../context/AppContext";

/**
 * Renders one result from the backend's hybrid recommendation engine
 * (GET /api/recommendations) — distinct from InternshipCard, which renders
 * an already-tracked application. These are catalog internships the
 * student hasn't applied to yet, so "Apply" creates the application.
 */
export default function RecommendedInternshipCard({ recommendation }) {
  const { applyFromRecommendation } = useApp();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const { internship, score, matchPercentage, reasons, matchedSkills, missingSkills } = recommendation;

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyFromRecommendation(internship._id);
      setApplied(true);
    } catch {
      // Swallow — most likely "already applied"; the button just re-enables.
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-[0_4px_24px_-4px_rgba(18,33,59,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-canvas">
            <Building2 size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold text-ink">{internship.company}</h3>
            <p className="truncate text-sm text-muted">{internship.role}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
          <Sparkles size={12} />
          {Math.round(score * 100)}% fit
        </span>
      </div>

      <p className="mt-3 text-sm text-ink-soft">
        Skill match: <span className="font-semibold">{matchPercentage}%</span>
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {matchedSkills.slice(0, 4).map((skill) => (
          <SkillBadge key={skill} skill={skill} status="have" size="sm" />
        ))}
        {missingSkills.slice(0, 2).map((skill) => (
          <SkillBadge key={skill} skill={skill} status="missing" size="sm" />
        ))}
      </div>

      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-line pt-3">
          {reasons.slice(0, 3).map((reason, idx) => (
            <li key={idx} className="text-xs text-muted">
              · {reason}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleApply}
        disabled={applying || applied}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-canvas transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        {applied ? (
          <>
            <Check size={13} /> Added to My Internships
          </>
        ) : applying ? (
          "Applying…"
        ) : (
          "Apply & Track"
        )}
      </button>
    </div>
  );
}
