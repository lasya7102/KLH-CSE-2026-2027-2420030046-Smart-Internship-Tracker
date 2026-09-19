const Internship = require("../../models/Internship");
const Application = require("../../models/Application");
const UserInteraction = require("../../models/UserInteraction");
const { buildCorpusIdf, buildContentFeatures } = require("./feature.service");
const { hasEnoughInteractionData, computeBehavioralScore } = require("./behavioral.service");
const { scoreInternship } = require("./scoring.service");

/**
 * Core recommendation pipeline (Sections 10-16).
 *
 * 1. Load the candidate pool: active internships, excluding ones the user
 *    already applied to or explicitly rejected (Section 16).
 * 2. Build a shared TF-IDF space over that pool (content-based, Section 12
 *    Phase 1) — always available, works for a brand-new user (Section 15).
 * 3. Load the user's interaction history; if there's enough of it
 *    (config-driven threshold), layer in the behavioral score (Phase 2).
 *    Otherwise the behavioral term is simply excluded and its weight is
 *    redistributed across the content-based signals (see scoring.service).
 * 4. Score, sort, and return the top N with an explanation for each.
 */
async function getRecommendations(user, { limit = 10 } = {}) {
  const [applications, rejectionInteractions] = await Promise.all([
    Application.find({ user: user._id }).select("internship status").lean(),
    UserInteraction.find({ user: user._id, eventType: "REJECT" }).select("internship").lean(),
  ]);

  const excludedIds = new Set([
    ...applications.map((a) => String(a.internship)),
    ...rejectionInteractions.map((r) => String(r.internship)),
  ]);

  const candidates = await Internship.find({ isActive: true }).lean();
  const now = new Date();
  const pool = candidates.filter((i) => {
    if (excludedIds.has(String(i._id))) return false;
    if (i.deadline && new Date(i.deadline) < now) return false; // expired
    return true;
  });

  if (!pool.length) {
    return { recommendations: [], usingBehavioralModel: false, poolSize: 0 };
  }

  const idf = buildCorpusIdf(pool);

  const interactions = await UserInteraction.find({ user: user._id })
    .populate("internship")
    .lean();
  const usingBehavioralModel = hasEnoughInteractionData(interactions);

  const scored = pool.map((internship) => {
    const features = buildContentFeatures(internship, user, idf);
    const behavioralScore = usingBehavioralModel
      ? computeBehavioralScore(internship, interactions)
      : null;
    return scoreInternship({ internship, user, features, behavioralScore });
  });

  scored.sort((a, b) => b.score - a.score);

  return {
    recommendations: scored.slice(0, limit),
    usingBehavioralModel,
    poolSize: pool.length,
  };
}

/** Explanation for one specific internship (Section 13's explanation endpoint). */
async function explainRecommendation(user, internshipId) {
  const internship = await Internship.findById(internshipId).lean();
  if (!internship) return null;

  const pool = await Internship.find({ isActive: true }).lean();
  const idf = buildCorpusIdf(pool);
  const features = buildContentFeatures(internship, user, idf);

  const interactions = await UserInteraction.find({ user: user._id })
    .populate("internship")
    .lean();
  const usingBehavioralModel = hasEnoughInteractionData(interactions);
  const behavioralScore = usingBehavioralModel
    ? computeBehavioralScore(internship, interactions)
    : null;

  return scoreInternship({ internship, user, features, behavioralScore });
}

module.exports = { getRecommendations, explainRecommendation };
