import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, Send, Hourglass, Users, Trophy, Plus, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import StatCard from "../components/StatCard";
import SkillBadge from "../components/SkillBadge";
import InternshipCard from "../components/InternshipCard";
import RecommendationCard from "../components/RecommendationCard";
import SkillDemandBar from "../components/SkillDemandBar";
import AddSkillModal from "../components/AddSkillModal";
import { useState } from "react";

export default function Dashboard() {
  const { profile, internships, studentSkills, removeSkill, missingSkillPriority, skillDemand } =
    useApp();
  const [addSkillOpen, setAddSkillOpen] = useState(false);

  const stats = useMemo(() => {
    const count = (status) => internships.filter((i) => i.status === status).length;
    return {
      total: internships.length,
      applied: count("Applied"),
      oa: count("OA Pending"),
      interview: count("Interview"),
      selected: count("Selected"),
    };
  }, [internships]);

  const topRecommended = useMemo(
    () =>
      [...internships]
        .filter((i) => i.status !== "Rejected")
        .sort((a, b) => b.matchInfo.percent - a.matchInfo.percent)
        .slice(0, 3),
    [internships]
  );

  const topMissing = missingSkillPriority[0];
  const sortedDemand = Object.entries(skillDemand).sort((a, b) => b[1] - a[1]);
  const maxDemand = sortedDemand[0]?.[1] || 1;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">
          Good Morning, {profile.name.split(" ")[0]} 👋
        </h2>
        <p className="mt-1 text-muted">Here is your internship overview.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Applications" value={stats.total} icon={FileText} accent="ink" />
        <StatCard label="Applied" value={stats.applied} icon={Send} accent="brand" />
        <StatCard label="OA Pending" value={stats.oa} icon={Hourglass} accent="caution" />
        <StatCard label="Interviews" value={stats.interview} icon={Users} accent="caution" />
        <StatCard label="Selected" value={stats.selected} icon={Trophy} accent="growth" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Skills */}
        <div className="rounded-2xl border border-line bg-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-ink">My Skills</h3>
            <button
              onClick={() => setAddSkillOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand hover:text-white transition-colors"
            >
              <Plus size={14} /> Add Skill
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {studentSkills.map((skill) => (
              <SkillBadge key={skill} skill={skill} status="have" onRemove={removeSkill} />
            ))}
            {studentSkills.length === 0 && (
              <p className="text-sm text-muted">No skills added yet — add your first one.</p>
            )}
          </div>
        </div>

        {/* Top skill priority callout */}
        {topMissing && (
          <div className="rounded-2xl border border-alert/30 bg-alert-soft p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-alert">🔥 High Priority</p>
            <p className="mt-2 text-sm text-ink">
              <span className="font-semibold">{topMissing.skill}</span> is required by{" "}
              <span className="font-semibold">{topMissing.count}</span> internships and is currently
              missing from your profile.
            </p>
            <Link
              to="/recommendations"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-alert hover:underline"
            >
              See recommendation <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Recommended internships */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Recommended Internships</h3>
          <Link to="/recommendations" className="text-sm font-semibold text-brand hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {topRecommended.map((i) => (
            <InternshipCard key={i.id} internship={i} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* What should I learn next */}
        {topMissing ? (
          <RecommendationCard skill={topMissing.skill} count={topMissing.count} featured />
        ) : (
          <div className="rounded-2xl border border-growth/30 bg-growth-soft p-5">
            <p className="font-semibold text-growth">🎉 You're matched on every tracked skill!</p>
          </div>
        )}

        {/* Skill demand */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="font-display text-base font-semibold text-ink">Skill Demand</h3>
          <div className="mt-4 space-y-3">
            {sortedDemand.slice(0, 5).map(([skill, count]) => (
              <SkillDemandBar
                key={skill}
                skill={skill}
                count={count}
                max={maxDemand}
                have={studentSkills.some((s) => s.toLowerCase() === skill.toLowerCase())}
              />
            ))}
          </div>
        </div>
      </div>

      <AddSkillModal open={addSkillOpen} onClose={() => setAddSkillOpen(false)} />
    </div>
  );
}
