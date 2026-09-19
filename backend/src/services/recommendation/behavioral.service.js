const {
  MIN_INTERACTIONS_FOR_BEHAVIOR,
  INTERACTION_SIGNAL_WEIGHT,
} = require("../../config/recommendationWeights");
const { skillsToKeySet } = require("../../utils/skillUtils");

/**
 * Lightweight item-item behavioral model (Section 12, Phase 2).
 *
 * With a small dataset, true collaborative filtering (cross-user
 * interaction matrices) has too little signal to be meaningful, so this
 * implements the honest, practical version: for THIS user, look at the
 * internships they've positively/negatively engaged with, and score new
 * candidates by their similarity (shared required skills + same role/company)
 * to that engagement history, weighted by how positive each past signal was.
 *
 * This upgrades naturally into full user-item collaborative filtering later
 * (Section 12) without changing the public function signature — swap the
 * inner similarity computation for a real interaction-matrix lookup once
 * enough cross-user data exists.
 */

function hasEnoughInteractionData(interactions = []) {
  return interactions.length >= MIN_INTERACTIONS_FOR_BEHAVIOR;
}

function itemSimilarity(a, b) {
  const skillsA = skillsToKeySet(a.requiredSkills || []);
  const skillsB = skillsToKeySet(b.requiredSkills || []);
  let skillSim = 0;
  if (skillsA.size || skillsB.size) {
    const intersection = [...skillsA].filter((s) => skillsB.has(s)).length;
    const union = new Set([...skillsA, ...skillsB]).size || 1;
    skillSim = intersection / union; // Jaccard
  }
  const roleBonus = a.role && b.role && a.role.toLowerCase() === b.role.toLowerCase() ? 0.15 : 0;
  const companyBonus = a.company && b.company && a.company === b.company ? 0.1 : 0;
  return Math.min(1, skillSim + roleBonus + companyBonus);
}

/**
 * @param candidate internship being scored
 * @param interactions array of { internship: populated internship doc, eventType }
 * @returns 0..1 behavioral score, or null if there isn't enough data yet
 */
function computeBehavioralScore(candidate, interactions = []) {
  if (!hasEnoughInteractionData(interactions)) return null;

  const withInternship = interactions.filter((i) => i.internship);
  if (!withInternship.length) return 0;

  let weightedSum = 0;
  let weightTotal = 0;

  for (const interaction of withInternship) {
    const signal = INTERACTION_SIGNAL_WEIGHT[interaction.eventType] ?? 0;
    if (signal === 0) continue;
    const sim = itemSimilarity(candidate, interaction.internship);
    weightedSum += sim * signal;
    weightTotal += Math.abs(signal);
  }

  if (weightTotal === 0) return 0;
  // weightedSum/weightTotal naturally falls in [-1, 1] (REJECT contributes
  // negatively); clamp to [0, 1] since a "bad" behavioral signal should
  // floor at neutral rather than push the final score negative.
  const raw = weightedSum / weightTotal;
  return Math.max(0, Math.min(1, raw));
}

module.exports = { hasEnoughInteractionData, computeBehavioralScore, itemSimilarity };
