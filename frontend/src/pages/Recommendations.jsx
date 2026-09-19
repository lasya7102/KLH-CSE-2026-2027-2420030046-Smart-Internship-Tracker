import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import InternshipCard from "../components/InternshipCard";
import RecommendationCard from "../components/RecommendationCard";
import RecommendedInternshipCard from "../components/RecommendedInternshipCard";

export default function Recommendations() {
  const { internships, missingSkillPriority, catalogRecommendations, catalogLoading } = useApp();

  const sorted = useMemo(
    () =>
      [...internships]
        .filter((i) => i.status !== "Rejected")
        .sort((a, b) => b.matchInfo.percent - a.matchInfo.percent),
    [internships]
  );

  return (
    <div className="space-y-8">
      {missingSkillPriority.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">🎯 What Should I Learn Next?</h2>
          <p className="mt-1 text-sm text-muted">
            Ranked by how many active internships require each skill.
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {missingSkillPriority.slice(0, 3).map(({ skill, count }, idx) => (
              <RecommendationCard key={skill} skill={skill} count={count} featured={idx === 0} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Suggested From Our Catalog</h2>
        <p className="mt-1 text-sm text-muted">
          Powered by the hybrid recommendation engine — skill match, role fit, preferences, and your
          activity, blended and explained.
        </p>
        {catalogLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" /> Finding matches…
          </div>
        ) : catalogRecommendations.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No new suggestions right now — you may have applied to everything relevant, or the catalog
            needs more postings. Check back soon.
          </p>
        ) : (
          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {catalogRecommendations.map((rec) => (
              <RecommendedInternshipCard key={rec.internship._id} recommendation={rec} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">My Tracked Internships</h2>
        <p className="mt-1 text-sm text-muted">Sorted by skill match, highest first.</p>
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((i) => (
            <InternshipCard key={i.id} internship={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
