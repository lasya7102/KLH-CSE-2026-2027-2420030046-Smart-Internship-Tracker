const { skillsToKeySet, skillKey, normalizeSkill } = require("../../utils/skillUtils");

/**
 * Pure skill-match calculation — mirrors the frontend's original
 * src/utils/match.js exactly, so match% never regresses when moved server-side.
 *
 * IMPORTANT: `learningSkills` are intentionally NOT passed in here for the
 * normal match percentage (Section 4 / Section 7 requirement). Callers that
 * want a "projected match if I learn X" number use computeProjectedMatch.
 */
function computeMatch(requiredSkills = [], studentSkills = []) {
  const haveSet = skillsToKeySet(studentSkills);
  const matched = [];
  const missing = [];

  for (const raw of requiredSkills) {
    const skill = normalizeSkill(raw);
    if (!skill) continue;
    if (haveSet.has(skillKey(skill))) matched.push(skill);
    else missing.push(skill);
  }

  const total = matched.length + missing.length;
  const percent = total ? Math.round((matched.length / total) * 100) : 100;

  return { matched, missing, percent, total };
}

/** Match percentage if the student additionally knew `extraSkills`. */
function computeProjectedMatch(requiredSkills = [], studentSkills = [], extraSkills = []) {
  return computeMatch(requiredSkills, [...studentSkills, ...extraSkills]);
}

function matchTier(percent) {
  if (percent === 100) return "excellent";
  if (percent >= 70) return "good";
  if (percent >= 40) return "warning";
  return "low";
}

module.exports = { computeMatch, computeProjectedMatch, matchTier };
