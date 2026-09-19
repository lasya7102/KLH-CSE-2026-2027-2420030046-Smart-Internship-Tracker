import { api } from "./client";

export async function listApplications(params = {}) {
  const res = await api.get("/applications", params);
  return res.data;
}

export async function getApplication(id) {
  const res = await api.get(`/applications/${id}`);
  return res.data;
}

export async function createApplication(payload) {
  const res = await api.post("/applications", payload);
  return res.data;
}

export async function updateApplication(id, payload) {
  const res = await api.put(`/applications/${id}`, payload);
  return res.data;
}

export async function deleteApplication(id) {
  const res = await api.delete(`/applications/${id}`);
  return res.data;
}

export async function updateApplicationStatus(id, status) {
  const res = await api.patch(`/applications/${id}/status`, { status });
  return res.data;
}
