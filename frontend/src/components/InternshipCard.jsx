import { Link } from "react-router-dom";
import { ArrowUpRight, Building2 } from "lucide-react";
import { MatchBar } from "./MatchProgress";
import SkillBadge from "./SkillBadge";
import StatusBadge from "./StatusBadge";
import { formatDeadline, daysUntil } from "../utils/date";

export default function InternshipCard({ internship }) {
  const { id, company, role, requiredSkills, matchInfo, status, deadline } = internship;
  const urgent = daysUntil(deadline) !== null && daysUntil(deadline) <= 2 && daysUntil(deadline) >= 0;

  return (
    <div className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-[0_4px_24px_-4px_rgba(18,33,59,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-canvas">
            <Building2 size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold text-ink">{company}</h3>
            <p className="truncate text-sm text-muted">{role}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4">
        <MatchBar percent={matchInfo.percent} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {requiredSkills.map((skill) => (
          <SkillBadge
            key={skill}
            skill={skill}
            status={matchInfo.matched.includes(skill) ? "have" : "missing"}
            size="sm"
          />
        ))}
      </div>

      <p className="mt-3 text-sm text-ink-soft">
        You have{" "}
        <span className="font-semibold">
          {matchInfo.matched.length} of {matchInfo.total}
        </span>{" "}
        required skills.
      </p>

      {matchInfo.missing.length > 0 && (
        <p className="mt-1 text-sm text-caution">
          🎯 Learn <span className="font-semibold">{matchInfo.missing[0]}</span> to improve your match.
        </p>
      )}
      {matchInfo.missing.length === 0 && (
        <p className="mt-1 text-sm text-growth">🎉 You match all required skills!</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className={`text-xs font-medium ${urgent ? "text-alert" : "text-muted"}`}>
          Deadline: {formatDeadline(deadline)}
        </span>
        <Link
          to={`/internships/${id}`}
          className="inline-flex items-center gap-1 rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-canvas transition-colors hover:bg-ink-soft"
        >
          View Internship <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}
