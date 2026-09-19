import { api } from "./client";

export async function listInternships(params = {}) {
  const res = await api.get("/internships", params);
  return { items: res.data, pagination: res.meta?.pagination };
}

export async function getInternship(id) {
  const res = await api.get(`/internships/${id}`);
  return res.data;
}

export async function createInternship(payload) {
  const res = await api.post("/internships", payload);
  return res.data;
}

export async function updateInternship(id, payload) {
  const res = await api.put(`/internships/${id}`, payload);
  return res.data;
}

export async function deleteInternship(id) {
  const res = await api.delete(`/internships/${id}`);
  return res.data;
}

export async function getInternshipMatch(id) {
  const res = await api.get(`/internships/${id}/match`);
  return res.data;
}
