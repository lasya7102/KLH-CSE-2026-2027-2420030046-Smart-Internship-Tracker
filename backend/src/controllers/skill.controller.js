const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/ApiResponse");
const { getSkillDemand, getMissingSkillPriority } = require("../services/analytics/analytics.service");

// GET /api/skills/demand
const getDemand = asyncHandler(async (req, res) => {
  const demand = await getSkillDemand();
  const missingSkillPriority = await getMissingSkillPriority(req.user.skills);
  sendSuccess(res, 200, { demand, missingSkillPriority });
});

module.exports = { getDemand };
