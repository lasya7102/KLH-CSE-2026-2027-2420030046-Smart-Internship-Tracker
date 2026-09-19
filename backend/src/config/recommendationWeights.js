// Central place for every tunable knob in the recommendation engine.
// Nothing in services/ should hardcode a weight or threshold directly —
// everything is read from here, and this file reads from env vars so the
// weights can be adjusted per-environment without touching code.

function num(envVal, fallback) {
  const parsed = Number(envVal);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const RAW_WEIGHTS = {
  skillMatch: num(process.env.REC_WEIGHT_SKILL, 0.4),
  roleSimilarity: num(process.env.REC_WEIGHT_ROLE, 0.2),
  learningSkillRelevance: num(process.env.REC_WEIGHT_LEARNING, 0.1),
  locationPreference: num(process.env.REC_WEIGHT_LOCATION, 0.1),
  workModePreference: num(process.env.REC_WEIGHT_WORKMODE, 0.05),
  stipendPreference: num(process.env.REC_WEIGHT_STIPEND, 0.05),
  behavioralSimilarity: num(process.env.REC_WEIGHT_BEHAVIOR, 0.1),
};

const weightSum = Object.values(RAW_WEIGHTS).reduce((a, b) => a + b, 0) || 1;
const WEIGHTS = Object.fromEntries(
  Object.entries(RAW_WEIGHTS).map(([k, v]) => [k, v / weightSum])
);

const MIN_INTERACTIONS_FOR_BEHAVIOR = num(process.env.REC_MIN_INTERACTIONS_FOR_BEHAVIOR, 5);

const INTERACTION_SIGNAL_WEIGHT = {
  VIEW: 0.1,
  SEARCH: 0.05,
  CLICK: 0.25,
  RECOMMENDATION_CLICK: 0.3,
  SAVE: 0.6,
  APPLY: 1.0,
  SKILL_LEARNED: 0,
  REJECT: -1.0,
};

const DEADLINE_BOOST_MAX = 0.06;
const DEADLINE_BOOST_WINDOW_DAYS = 5;

module.exports = {
  WEIGHTS,
  MIN_INTERACTIONS_FOR_BEHAVIOR,
  INTERACTION_SIGNAL_WEIGHT,
  DEADLINE_BOOST_MAX,
  DEADLINE_BOOST_WINDOW_DAYS,
};
