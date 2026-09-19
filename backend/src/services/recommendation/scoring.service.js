const { WEIGHTS, DEADLINE_BOOST_MAX, DEADLINE_BOOST_WINDOW_DAYS } = require("../../config/recommendationWeights");
const { computeMatch } = require("../matching/skillMatch.service");
const { skillsToKeySet, skillKey } = require("../../utils/skillUtils");

function daysUntil(date) {
  if (!date) return null;
  const diff = (new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000;
  return Math.round(diff);
}

/** Small, capped nudge for internships closing soon — never dominates relevance. */
function deadlineBoost(internship) {
  const days = daysUntil(internship.deadline);
  if (days === null || days < 0 || days > DEADLINE_BOOST_WINDOW_DAYS) return 0;
  const urgency = 1 - days / DEADLINE_BOOST_WINDOW_DAYS; // 1 = today, 0 = at window edge
  return urgency * DEADLINE_BOOST_MAX;
}

/**
 * Combines content-based features + optional behavioral score into the
 * final weighted recommendation score (Section 11's formula), using
 * WEIGHTS from config so nothing is hardcoded here.
 */
function combineScore(features, behavioralScore) {
  const behavioral = behavioralScore === null ? 0 : behavioralScore;
  // When behavioral data is insufficient, its weight is redistributed
  // proportionally across the remaining content-based components rather
  // than silently discarded — this keeps the score's meaning (a weighted
  // average of everything we have signal for) intact for cold-start users.
  const usingBehavior = behavioralScore !== null;
  const behaviorWeight = usingBehavior ? WEIGHTS.behavioralSimilarity : 0;
  const redistribution = usingBehavior ? 1 : 1 / (1 - WEIGHTS.behavioralSimilarity);

  const contentScore =
    features.skillMatch * WEIGHTS.skillMatch +
    features.roleSimilarity * WEIGHTS.roleSimilarity +
    features.learningSkillRelevance * WEIGHTS.learningSkillRelevance +
    features.locationPreference * WEIGHTS.locationPreference +
    features.workModePreference * WEIGHTS.workModePreference +
    features.stipendPreference * WEIGHTS.stipendPreference;

  const base = contentScore * redistribution + behavioral * behaviorWeight;
  return Math.max(0, Math.min(1, base));
}

/** Human-readable explanations for why this internship was recommended. */
function buildReasons({ internship, user, features, matchInfo, usingBehavior }) {
  const reasons = [];

  if (matchInfo.matched.length > 0) {
    const shown = matchInfo.matched.slice(0, 3).join(", ");
    reasons.push(`Strong match with your ${shown} skill${matchInfo.matched.length > 1 ? "s" : ""}`);
  }

  if (user.preferredRoles && user.preferredRoles.length && features.roleSimilarity > 0.3) {
    const closest = user.preferredRoles[0];
    reasons.push(`Aligns with your preferred "${closest}" role`);
  }

  const learningSet = skillsToKeySet(user.learningSkills || []);
  const learningHits = (internship.requiredSkills || []).filter((s) => learningSet.has(skillKey(s)));
  if (learningHits.length) {
    reasons.push(
      `Uses ${learningHits.slice(0, 2).join(", ")}, which you're currently learning`
    );
  }

  if (features.locationPreference === 1 && user.preferredLocations && user.preferredLocations.length) {
    reasons.push(`Located in one of your preferred locations (${internship.location})`);
  }

  if (features.workModePreference === 1) {
    reasons.push(`Matches your preferred work mode (${internship.workMode})`);
  }

  if (features.stipendPreference >= 1 && user.preferredMinStipend) {
    reasons.push(`Meets your minimum stipend expectation`);
  }

  if (usingBehavior) {
    reasons.push(`Similar to internships you've previously engaged with`);
  }

  const days = daysUntil(internship.deadline);
  if (days !== null && days >= 0 && days <= DEADLINE_BOOST_WINDOW_DAYS) {
    reasons.push(`Deadline is approaching (${days === 0 ? "today" : `${days} day(s) left`})`);
  }

  if (!reasons.length) {
    reasons.push("Matches your overall profile and internship activity");
  }

  return reasons;
}

function scoreInternship({ internship, user, features, behavioralScore }) {
  const matchInfo = computeMatch(internship.requiredSkills, user.skills);
  const usingBehavior = behavioralScore !== null && behavioralScore !== undefined;
  const score = combineScore(features, usingBehavior ? behavioralScore : null);
  const boostedScore = Math.min(1, score + deadlineBoost(internship));

  return {
    internship,
    score: Math.round(boostedScore * 1000) / 1000,
    matchPercentage: matchInfo.percent,
    matchedSkills: matchInfo.matched,
    missingSkills: matchInfo.missing,
    reasons: buildReasons({ internship, user, features, matchInfo, usingBehavior }),
  };
}

module.exports = { scoreInternship, combineScore, deadlineBoost, daysUntil };
