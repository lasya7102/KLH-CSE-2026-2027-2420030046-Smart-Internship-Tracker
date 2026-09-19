const { computeMatch } = require("../matching/skillMatch.service");
const { skillsToKeySet, skillKey } = require("../../utils/skillUtils");
const { buildIdf, textSimilarity } = require("./textSimilarity.util");
const { parseStipendAmount } = require("../matching/stipendParse.util");

/**
 * Builds one shared IDF model over the whole active-internship catalog so
 * every internship's role-similarity score is computed against the same
 * vector space. Rebuilt per recommendation request — cheap at this data
 * scale and always reflects the current catalog (Section 12).
 */
function buildCorpusIdf(internships = []) {
  const documents = internships.map((i) =>
    [i.role, i.description, (i.requiredSkills || []).join(" ")].filter(Boolean).join(" ")
  );
  return buildIdf(documents);
}

/** 0..1 — fraction of required skills the student currently possesses. */
function skillMatchScore(internship, user) {
  const { percent } = computeMatch(internship.requiredSkills, user.skills);
  return percent / 100;
}

/**
 * 0..1 — TF-IDF cosine similarity between the internship's role/description
 * text and the student's preferred-role text (falls back to comparing
 * against the student's current skills if no preferred roles are set, so
 * cold-start users still get a meaningful signal).
 */
function roleSimilarityScore(internship, user, idf) {
  const userText = user.preferredRoles && user.preferredRoles.length
    ? user.preferredRoles.join(" ")
    : user.skills.join(" ");
  if (!userText.trim()) return 0;

  const internshipText = [internship.role, internship.description].filter(Boolean).join(" ");
  return textSimilarity(userText, internshipText, idf);
}

/**
 * 0..1 — how much this internship would benefit from skills the student is
 * actively learning (a skill the student is learning that this internship
 * requires is exactly the "learning pays off here" signal).
 */
function learningSkillRelevanceScore(internship, user) {
  const required = internship.requiredSkills || [];
  if (!required.length || !user.learningSkills.length) return 0;

  const learningSet = skillsToKeySet(user.learningSkills);
  const relevantCount = required.filter((s) => learningSet.has(skillKey(s))).length;
  return relevantCount / required.length;
}

/** 0..1 — does the internship's location match a preferred location? Remote always counts. */
function locationPreferenceScore(internship, user) {
  if (!user.preferredLocations || !user.preferredLocations.length) return 0.5; // neutral, no signal
  const loc = (internship.location || "").toLowerCase();
  if (loc.includes("remote")) return 1;
  const hit = user.preferredLocations.some((p) => loc.includes(String(p).toLowerCase()));
  return hit ? 1 : 0;
}

/** 0..1 — work-mode preference match. */
function workModePreferenceScore(internship, user) {
  if (!user.preferredWorkMode || user.preferredWorkMode === "Any") return 0.5;
  return internship.workMode === user.preferredWorkMode ? 1 : 0;
}

/** 0..1 — stipend relative to the student's minimum expectation. */
function stipendPreferenceScore(internship, user) {
  const min = user.preferredMinStipend || 0;
  if (!min) return 0.5; // no preference set -> neutral
  const amount = internship.stipendAmount || parseStipendAmount(internship.stipend);
  if (!amount) return 0.5;
  if (amount >= min) return 1;
  // Partial credit that decays as the gap grows, floors at 0.
  return Math.max(0, amount / min);
}

function buildContentFeatures(internship, user, idf) {
  return {
    skillMatch: skillMatchScore(internship, user),
    roleSimilarity: roleSimilarityScore(internship, user, idf),
    learningSkillRelevance: learningSkillRelevanceScore(internship, user),
    locationPreference: locationPreferenceScore(internship, user),
    workModePreference: workModePreferenceScore(internship, user),
    stipendPreference: stipendPreferenceScore(internship, user),
  };
}

module.exports = { buildCorpusIdf, buildContentFeatures };
