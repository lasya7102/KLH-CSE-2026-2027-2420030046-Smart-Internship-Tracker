const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/ApiResponse");
const { getRecommendations, explainRecommendation } = require("../services/recommendation/recommendation.service");
const UserInteraction = require("../models/UserInteraction");

// GET /api/recommendations?limit=10
const listRecommendations = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const { recommendations, usingBehavioralModel, poolSize } = await getRecommendations(req.user, {
    limit,
  });

  sendSuccess(res, 200, { recommendations }, { usingBehavioralModel, poolSize });
});

// GET /api/recommendations/:internshipId/explanation
const explainOne = asyncHandler(async (req, res) => {
  const explanation = await explainRecommendation(req.user, req.params.internshipId);
  if (!explanation) throw ApiError.notFound("Internship not found");
  sendSuccess(res, 200, explanation);
});

// POST /api/recommendations/:internshipId/interaction
// Body: { eventType: "RECOMMENDATION_CLICK" | "VIEW" | "SAVE" | "APPLY" | "REJECT", metadata? }
// Section 14: distinguishes event types rather than treating every click as
// a positive signal — the weighting of each type lives in
// config/recommendationWeights.js, not here.
const recordInteraction = asyncHandler(async (req, res) => {
  const { eventType, metadata } = req.body;
  const allowed = UserInteraction.EVENT_TYPES;
  if (!allowed.includes(eventType)) {
    throw ApiError.badRequest(`eventType must be one of: ${allowed.join(", ")}`);
  }

  const interaction = await UserInteraction.create({
    user: req.user._id,
    internship: req.params.internshipId,
    eventType,
    metadata: metadata || {},
  });

  sendSuccess(res, 201, interaction);
});

module.exports = { listRecommendations, explainOne, recordInteraction };
