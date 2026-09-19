const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/ApiResponse");
const Application = require("../models/Application");
const { getApplicationStatusStats, getMissingSkillPriority } = require("../services/analytics/analytics.service");
const { getRecommendations } = require("../services/recommendation/recommendation.service");
const { daysUntil } = require("../services/recommendation/scoring.service");

// GET /api/dashboard — everything the Dashboard page needs in one call
// (Section 8: "Do not make the frontend perform unnecessary database-like
// calculations").
const getDashboard = asyncHandler(async (req, res) => {
  const user = req.user;

  const [statusStats, missingSkillPriority, applications, recResult] = await Promise.all([
    getApplicationStatusStats(user._id),
    getMissingSkillPriority(user.skills),
    Application.find({ user: user._id }).populate("internship").lean(),
    getRecommendations(user, { limit: 3 }),
  ]);

  const stats = {
    totalApplications: statusStats.totalApplications,
    applied: statusStats.applicationStatus.Applied,
    oaPending: statusStats.applicationStatus["OA Pending"],
    interviews: statusStats.applicationStatus.Interview,
    selected: statusStats.applicationStatus.Selected,
    rejected: statusStats.applicationStatus.Rejected,
  };

  const upcomingDeadlines = applications
    .filter((a) => a.internship && a.internship.deadline)
    .map((a) => ({
      internship: a.internship,
      applicationId: a._id,
      status: a.status,
      daysUntil: daysUntil(a.internship.deadline),
    }))
    .filter((d) => d.daysUntil !== null && d.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  sendSuccess(res, 200, {
    user: user.toPublicJSON(),
    stats,
    skills: user.skills,
    learningSkills: user.learningSkills,
    topRecommendations: recResult.recommendations,
    upcomingDeadlines,
    missingSkillPriority: missingSkillPriority.slice(0, 5),
  });
});

module.exports = { getDashboard };
