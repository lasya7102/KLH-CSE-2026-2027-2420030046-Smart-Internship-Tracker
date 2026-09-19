// A small, dependency-free TF-IDF + cosine-similarity implementation.
// This is intentionally lightweight (Section 12: "Do not pretend that a
// sophisticated ML model is trained when the database contains only a few
// records") — it's a genuine vector-space text representation, just not a
// neural embedding model, which is the right tool for this data size.

const STOPWORDS = new Set([
  "a","an","the","and","or","of","to","in","on","for","with","at","by","is",
  "are","be","this","that","from","as","it","you","your","will","we","our",
  "who","join","work","working","team","using","using","across",
]);

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s+#./-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Builds an IDF map from a corpus of documents (each a raw text string). */
function buildIdf(documents = []) {
  const df = new Map();
  const docTokenSets = documents.map((doc) => new Set(tokenize(doc)));
  const N = Math.max(docTokenSets.length, 1);

  for (const tokenSet of docTokenSets) {
    for (const token of tokenSet) {
      df.set(token, (df.get(token) || 0) + 1);
    }
  }

  const idf = new Map();
  for (const [token, count] of df.entries()) {
    idf.set(token, Math.log((N + 1) / (count + 1)) + 1); // smoothed idf, always > 0
  }
  return idf;
}

/** Turns raw text into a sparse TF-IDF vector (Map<token, weight>). */
function tfidfVector(text, idf) {
  const tokens = tokenize(text);
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);

  const vec = new Map();
  for (const [token, freq] of tf.entries()) {
    const weight = freq * (idf.get(token) || 1);
    vec.set(token, weight);
  }
  return vec;
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA.size || !vecB.size) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const val of vecA.values()) normA += val * val;
  for (const val of vecB.values()) normB += val * val;

  const [smaller, larger] = vecA.size <= vecB.size ? [vecA, vecB] : [vecB, vecA];
  for (const [token, val] of smaller.entries()) {
    if (larger.has(token)) dot += val * larger.get(token);
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** Convenience: similarity between two raw strings given a shared idf map. */
function textSimilarity(textA, textB, idf) {
  return cosineSimilarity(tfidfVector(textA, idf), tfidfVector(textB, idf));
}

module.exports = { tokenize, buildIdf, tfidfVector, cosineSimilarity, textSimilarity };
