import { api, setToken } from "./client";

export async function register({ name, email, password, college, branch, gradYear, skills }) {
  const res = await api.post("/auth/register", {
    name,
    email,
    password,
    college,
    branch,
    graduationYear: gradYear || undefined,
    skills,
  });
  setToken(res.data.token);
  return res.data.user;
}

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  setToken(res.data.token);
  return res.data.user;
}

export async function fetchMe() {
  const res = await api.get("/auth/me");
  return res.data.user;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // Best-effort — token is discarded client-side regardless.
  } finally {
    setToken(null);
  }
}
