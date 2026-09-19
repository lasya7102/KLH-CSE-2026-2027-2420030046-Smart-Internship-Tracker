// All skill comparisons across the codebase go through here so
// case-insensitivity and de-duplication are handled in exactly one place.

function normalizeSkill(skill) {
  return String(skill || "").trim();
}

function skillKey(skill) {
  return normalizeSkill(skill).toLowerCase();
}

function dedupeSkills(skills = []) {
  const seen = new Map(); // key -> first-seen original casing
  for (const s of skills) {
    const key = skillKey(s);
    if (!key) continue;
    if (!seen.has(key)) seen.set(key, normalizeSkill(s));
  }
  return [...seen.values()];
}

function skillsToKeySet(skills = []) {
  return new Set(skills.map(skillKey).filter(Boolean));
}

function includesSkill(skillList = [], skill) {
  const key = skillKey(skill);
  return skillList.some((s) => skillKey(s) === key);
}

function removeSkill(skillList = [], skill) {
  const key = skillKey(skill);
  return skillList.filter((s) => skillKey(s) !== key);
}

module.exports = {
  normalizeSkill,
  skillKey,
  dedupeSkills,
  skillsToKeySet,
  includesSkill,
  removeSkill,
};
