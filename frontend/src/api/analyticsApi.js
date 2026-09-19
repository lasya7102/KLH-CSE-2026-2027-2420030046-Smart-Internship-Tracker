import { api } from "./client";

export async function getAnalytics() {
  const res = await api.get("/analytics");
  return res.data;
}
