// Stipend is stored as a display string ("₹45,000/mo") for the frontend, but
// the recommendation engine and filters need a comparable number.
function parseStipendAmount(stipendStr) {
  if (!stipendStr) return 0;
  const digits = String(stipendStr).replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

module.exports = { parseStipendAmount };
