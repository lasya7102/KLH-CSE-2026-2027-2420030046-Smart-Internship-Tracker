// Anchor "today" to the app's demo date so deadlines read naturally
// regardless of when the prototype is actually opened.
const TODAY = new Date("2026-08-25T00:00:00");

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const diff = Math.round((target - TODAY) / (1000 * 60 * 60 * 24));
  return diff;
}

export function formatDeadline(dateStr) {
  if (!dateStr) return "—";
  const days = daysUntil(dateStr);
  if (days < 0) return "Closed";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
