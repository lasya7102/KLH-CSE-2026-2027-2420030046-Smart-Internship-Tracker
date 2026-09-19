// Thin, named wrapper around feature.service so the "Phase 1: content-based
// model" described in the README maps directly onto one importable module,
// even though the actual feature math lives in feature.service.js to avoid
// duplicating it between here and recommendation.service.js.
const { buildCorpusIdf, buildContentFeatures } = require("./feature.service");

function getContentBasedFeatures(internship, user, idf) {
  return buildContentFeatures(internship, user, idf);
}

module.exports = { buildCorpusIdf, getContentBasedFeatures };
