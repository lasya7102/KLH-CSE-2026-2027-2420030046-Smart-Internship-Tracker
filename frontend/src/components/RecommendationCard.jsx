import { Target, ArrowRight } from "lucide-react";
import { computeMatch } from "../utils/match";
import { useApp } from "../context/AppContext";

export default function RecommendationCard({ skill, count, featured = false }) {
  const { internships, studentSkills, markAsLearning, learningSkills } = useApp();

  const relevant = internships.filter((i) => i.requiredSkills.includes(skill));
  const avg = (fn) =>
    relevant.length ? Math.round(relevant.reduce((sum, i) => sum + fn(i), 0) / relevant.length) : 0;

  const currentAvg = avg((i) => i.matchInfo.percent);
  const potentialAvg = avg((i) => {
    const projected = [...studentSkills, skill];
    return computeMatch(i.requiredSkills, projected).percent;
  });

  const isLearning = learningSkills.some((s) => s.toLowerCase() === skill.toLowerCase());

  return (
    <div
      className={`rounded-2xl border p-5 ${
        featured ? "border-brand/30 bg-brand-soft/50" : "border-line bg-surface"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
        <Target size={14} />
        What should I learn next?
      </div>

      <h3 className="mt-2 font-display text-2xl font-bold text-ink">{skill}</h3>
      <p className="mt-1 text-sm text-muted">
        Required by <span className="font-semibold text-ink">{count}</span> of your saved internships.
      </p>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted">Current match</p>
          <p className="font-mono-num text-xl font-semibold text-ink">{currentAvg}%</p>
        </div>
        <ArrowRight size={18} className="text-muted" />
        <div className="flex-1">
          <p className="text-xs font-medium text-muted">After learning {skill}</p>
          <p className="font-mono-num text-xl font-semibold text-growth">{potentialAvg}%</p>
        </div>
      </div>

      <button
        onClick={() => markAsLearning(skill)}
        disabled={isLearning}
        className="mt-5 w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-caution disabled:text-ink"
      >
        {isLearning ? "Marked as Learning" : "Mark as Learning"}
      </button>
    </div>
  );
}
