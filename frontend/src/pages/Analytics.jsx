import { useMemo } from "react";
import { useApp } from "../context/AppContext";

const STATUS_ORDER = ["Applied", "OA Pending", "Interview", "Selected", "Rejected"];
const STATUS_COLOR = {
  Applied: "bg-brand",
  "OA Pending": "bg-caution",
  Interview: "bg-caution",
  Selected: "bg-growth",
  Rejected: "bg-alert",
};

const PRIORITY_STYLE = {
  High: { label: "🔴 High Priority", text: "text-alert" },
  Medium: { label: "🟠 Medium Priority", text: "text-caution" },
  Low: { label: "🟢 Low Priority", text: "text-growth" },
};

export default function Analytics() {
  const { internships, skillDemand, missingSkillPriority } = useApp();

  const statusCounts = useMemo(() => {
    const counts = {};
    STATUS_ORDER.forEach((s) => (counts[s] = 0));
    internships.forEach((i) => (counts[i.status] = (counts[i.status] || 0) + 1));
    return counts;
  }, [internships]);
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  const topSkills = useMemo(
    () => Object.entries(skillDemand).sort((a, b) => b[1] - a[1]).slice(0, 6),
    [skillDemand]
  );
  const maxSkill = topSkills[0]?.[1] || 1;

  const gaps = useMemo(() => {
    return missingSkillPriority.map(({ skill, count }, idx) => ({
      skill,
      priority: idx === 0 ? "High" : idx <= 2 ? "Medium" : "Low",
    }));
  }, [missingSkillPriority]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Application status */}
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="font-display text-base font-semibold text-ink">Application Status</h3>
          <div className="mt-5 space-y-3.5">
            {STATUS_ORDER.map((status) => (
              <div key={status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-soft">{status}</span>
                  <span className="font-mono-num font-semibold text-ink">{statusCounts[status]}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-line/60">
                  <div
                    className={`h-full rounded-full ${STATUS_COLOR[status]}`}
                    style={{ width: `${(statusCounts[status] / maxStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most required skills */}
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="font-display text-base font-semibold text-ink">Most Required Skills</h3>
          <div className="mt-5 space-y-3.5">
            {topSkills.map(([skill, count]) => (
              <div key={skill}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-soft">{skill}</span>
                  <span className="font-mono-num text-xs text-muted">{count} internships</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-line/60">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(count / maxSkill) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill gaps */}
      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-display text-base font-semibold text-ink">Your Skill Gaps</h3>
        {gaps.length === 0 ? (
          <p className="mt-3 text-sm text-growth">🎉 No skill gaps — you're matched everywhere.</p>
        ) : (
          <div className="mt-4 divide-y divide-line">
            {gaps.map(({ skill, priority }) => (
              <div key={skill} className="flex items-center justify-between py-2.5">
                <span className="text-sm font-medium text-ink">{skill}</span>
                <span className={`text-sm font-semibold ${PRIORITY_STYLE[priority].text}`}>
                  {PRIORITY_STYLE[priority].label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
