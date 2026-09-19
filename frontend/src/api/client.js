// Thin fetch wrapper shared by every api/*.js module. Centralizes:
//  - base URL configuration
//  - attaching the JWT to every request
//  - turning non-2xx responses into a consistent Error the UI can display
//  - one place to change if the backend's response envelope ever changes

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const TOKEN_KEY = "sit_token";
let authToken = typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

export function getToken() {
  return authToken;
}

export function setToken(token) {
  authToken = token;
  if (typeof localStorage === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, params } = {}) {
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers = { "Content-Type": "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (_networkErr) {
    const err = new Error("Could not reach the server. Is the backend running?");
    err.isNetworkError = true;
    throw err;
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // No JSON body (e.g. 204) — that's fine.
  }

  if (!res.ok) {
    const message = (json && json.message) || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.errors = (json && json.errors) || [];
    throw err;
  }

  return json || { success: true, data: null };
}

export const api = {
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
