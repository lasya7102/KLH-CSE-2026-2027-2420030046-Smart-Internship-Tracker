import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin, Wallet, CalendarDays } from "lucide-react";
import { useApp } from "../context/AppContext";
import { MatchRing } from "../components/MatchProgress";
import SkillBadge from "../components/SkillBadge";
import StatusBadge from "../components/StatusBadge";
import { formatDate, formatDeadline } from "../utils/date";

export default function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { internships, markSkillLearned, learningSkills } = useApp();

  const internship = internships.find((i) => i.id === id);

  if (!internship) {
    return (
      <div className="rounded-2xl border border-dashed border-line py-16 text-center">
        <p className="font-medium text-ink">Internship not found.</p>
        <button onClick={() => navigate("/internships")} className="mt-3 text-sm font-semibold text-brand hover:underline">
          Back to My Internships
        </button>
      </div>
    );
  }

  const { company, role, description, requiredSkills, matchInfo, status, deadline, oaDate, interviewDate, url, location, stipend } =
    internship;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">{company}</h2>
            <p className="mt-0.5 text-base text-muted">{role}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-soft">
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="text-muted" /> {location}
                </span>
              )}
              {stipend && (
                <span className="inline-flex items-center gap-1.5">
                  <Wallet size={14} className="text-muted" /> {stipend}
                </span>
              )}
            </div>
          </div>
          <MatchRing percent={matchInfo.percent} size={88} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <StatusBadge status={status} />
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              Open application <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {description && (
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="font-display text-base font-semibold text-ink">Job Description</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="font-display text-base font-semibold text-ink">Required Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {requiredSkills.map((skill) => (
              <SkillBadge
                key={skill}
                skill={skill}
                status={matchInfo.matched.includes(skill) ? "have" : "missing"}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="font-display text-base font-semibold text-ink">Your Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {matchInfo.matched.length > 0 ? (
              matchInfo.matched.map((skill) => <SkillBadge key={skill} skill={skill} status="have" />)
            ) : (
              <p className="text-sm text-muted">None of the required skills yet.</p>
            )}
          </div>
        </div>
      </div>

      {matchInfo.missing.length > 0 ? (
        <div className="rounded-2xl border border-alert/25 bg-alert-soft p-6">
          <h3 className="font-display text-base font-semibold text-ink">Missing Skill{matchInfo.missing.length > 1 ? "s" : ""}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {matchInfo.missing.map((skill) => (
              <SkillBadge key={skill} skill={skill} status="missing" />
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            🎯 <span className="font-semibold">Recommendation:</span> Learning{" "}
            <span className="font-semibold">{matchInfo.missing[0]}</span> can improve your skill match
            and eligibility.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {matchInfo.missing.map((skill) => {
              const isLearning = learningSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
              return (
                <button
                  key={skill}
                  onClick={() => markSkillLearned(skill)}
                  className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:bg-ink-soft"
                >
                  {isLearning ? `Confirm learned: ${skill}` : `Mark "${skill}" as Learned`}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-growth/30 bg-growth-soft p-6 text-center">
          <p className="font-semibold text-growth">🎉 You now match all required skills!</p>
        </div>
      )}

      <div className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-display text-base font-semibold text-ink">Timeline</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TimelineItem label="Deadline" value={deadline ? `${formatDate(deadline)} (${formatDeadline(deadline)})` : "—"} />
          <TimelineItem label="OA / Test Date" value={oaDate ? formatDate(oaDate) : "—"} />
          <TimelineItem label="Interview Date" value={interviewDate ? formatDate(interviewDate) : "—"} />
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ label, value }) {
  return (
    <div className="rounded-xl bg-canvas p-3.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <CalendarDays size={13} /> {label}
      </div>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
