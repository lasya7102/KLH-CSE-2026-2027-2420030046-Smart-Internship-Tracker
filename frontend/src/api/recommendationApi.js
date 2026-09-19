import { api } from "./client";

export async function listRecommendations(limit = 10) {
  const res = await api.get("/recommendations", { limit });
  return { recommendations: res.data.recommendations, meta: res.meta };
}

export async function explainRecommendation(internshipId) {
  const res = await api.get(`/recommendations/${internshipId}/explanation`);
  return res.data;
}

export async function recordInteraction(internshipId, eventType, metadata) {
  const res = await api.post(`/recommendations/${internshipId}/interaction`, {
    eventType,
    metadata,
  });
  return res.data;
}
