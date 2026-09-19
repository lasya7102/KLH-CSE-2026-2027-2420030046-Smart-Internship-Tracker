import { api } from "./client";

export async function getProfile() {
  const res = await api.get("/users/profile");
  return res.data.user;
}

export async function updateProfile(updates) {
  const payload = { ...updates };
  if (payload.gradYear !== undefined) {
    payload.graduationYear = payload.gradYear;
    delete payload.gradYear;
  }
  const res = await api.put("/users/profile", payload);
  return res.data.user;
}

export async function addSkill(skill) {
  const res = await api.post("/users/skills", { skill });
  return res.data; // { skills, learningSkills }
}

export async function removeSkill(skill) {
  const res = await api.delete(`/users/skills/${encodeURIComponent(skill)}`);
  return res.data; // { skills }
}

export async function addLearningSkill(skill) {
  const res = await api.post("/users/learning-skills", { skill });
  return res.data; // { learningSkills }
}

export async function removeLearningSkill(skill) {
  const res = await api.delete(`/users/learning-skills/${encodeURIComponent(skill)}`);
  return res.data; // { learningSkills }
}

export async function markSkillLearned(skill) {
  const res = await api.post(`/users/learning-skills/${encodeURIComponent(skill)}/learn`);
  return res.data; // { skills, learningSkills }
}
