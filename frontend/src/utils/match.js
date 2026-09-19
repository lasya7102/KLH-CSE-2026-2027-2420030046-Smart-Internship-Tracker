// Computes skill match between what an internship requires and what the
// student currently knows. Kept as a pure function so match % always
// reflects the live skills list rather than a stored/stale number.
export function computeMatch(requiredSkills, studentSkills) {
  const haveSet = new Set(studentSkills.map((s) => s.toLowerCase()));
  const matched = requiredSkills.filter((s) => haveSet.has(s.toLowerCase()));
  const missing = requiredSkills.filter((s) => !haveSet.has(s.toLowerCase()));
  const percent = requiredSkills.length
    ? Math.round((matched.length / requiredSkills.length) * 100)
    : 100;
  return { matched, missing, percent, total: requiredSkills.length };
}

export function matchTier(percent) {
  if (percent === 100) return "excellent";
  if (percent >= 70) return "good";
  if (percent >= 40) return "warning";
  return "low";
}

export const tierColor = {
  excellent: {
    text: "text-growth",
    bg: "bg-growth-soft",
    ring: "#0EA37A",
    bar: "bg-growth",
  },
  good: {
    text: "text-brand",
    bg: "bg-brand-soft",
    ring: "#4F5FE0",
    bar: "bg-brand",
  },
  warning: {
    text: "text-caution",
    bg: "bg-caution-soft",
    ring: "#F5A623",
    bar: "bg-caution",
  },
  low: {
    text: "text-alert",
    bg: "bg-alert-soft",
    ring: "#E8543F",
    bar: "bg-alert",
  },
};
