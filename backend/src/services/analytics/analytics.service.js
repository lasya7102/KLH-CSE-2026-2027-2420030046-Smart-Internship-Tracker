const mongoose = require("mongoose");
const Application = require("../../models/Application");
const Internship = require("../../models/Internship");
const { skillsToKeySet, normalizeSkill, skillKey } = require("../../utils/skillUtils");

const STATUS_ORDER = ["Applied", "OA Pending", "Interview", "Selected", "Rejected"];

/** Application status breakdown + selection/interview rates for one user. */
async function getApplicationStatusStats(userId) {
  const rows = await Application.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const applicationStatus = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]));
  rows.forEach((r) => {
    applicationStatus[r._id] = r.count;
  });

  const totalApplications = Object.values(applicationStatus).reduce((a, b) => a + b, 0);
  const selectionRate = totalApplications
    ? Math.round((applicationStatus.Selected / totalApplications) * 100)
    : 0;
  const interviewRate = totalApplications
    ? Math.round(
        ((applicationStatus.Interview + applicationStatus.Selected) / totalApplications) * 100
      )
    : 0;

  return { applicationStatus, totalApplications, selectionRate, interviewRate };
}

/**
 * How many active internships require each skill, computed from the whole
 * active-internship catalog (matches the frontend's original skillDemand,
 * which counted across all non-rejected tracked internships — here we widen
 * it to the full active catalog so demand reflects the market, not just what
 * one student happens to be tracking).
 */
async function getSkillDemand() {
  const rows = await Internship.aggregate([
    { $match: { isActive: true } },
    { $unwind: "$requiredSkills" },
    {
      $group: {
        _id: { $toLower: "$requiredSkills" },
        skill: { $first: "$requiredSkills" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
  return rows.map((r) => ({ skill: r.skill, count: r.count }));
}

/**
 * Missing-skill priority for one student: demand-ranked skills the student
 * doesn't currently have, with a normalized 0-1 priorityScore.
 */
async function getMissingSkillPriority(studentSkills = []) {
  const demand = await getSkillDemand();
  const haveSet = skillsToKeySet(studentSkills);
  const missing = demand.filter((d) => !haveSet.has(skillKey(d.skill)));
  const maxCount = missing[0]?.count || 1;

  return missing.map((d) => ({
    skill: d.skill,
    internshipsRequiringSkill: d.count,
    count: d.count, // kept for the frontend's existing {skill, count} shape
    priorityScore: Math.round((d.count / maxCount) * 100) / 100,
  }));
}

async function getApplicationsOverTime(userId) {
  const rows = await Application.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$appliedOn" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r) => ({ date: r._id, count: r.count }));
}

async function buildAnalytics(user) {
  const [statusStats, skillDemand, missingSkillPriority, applicationsOverTime] = await Promise.all(
    [
      getApplicationStatusStats(user._id),
      getSkillDemand(),
      getMissingSkillPriority(user.skills),
      getApplicationsOverTime(user._id),
    ]
  );

  return {
    ...statusStats,
    skillDemand,
    missingSkillPriority,
    applicationsOverTime,
  };
}

module.exports = {
  getApplicationStatusStats,
  getSkillDemand,
  getMissingSkillPriority,
  getApplicationsOverTime,
  buildAnalytics,
};
