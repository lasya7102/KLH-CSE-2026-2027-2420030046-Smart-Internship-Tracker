const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/ApiResponse");
const { buildAnalytics } = require("../services/analytics/analytics.service");

// GET /api/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await buildAnalytics(req.user);
  sendSuccess(res, 200, analytics);
});

module.exports = { getAnalytics };
