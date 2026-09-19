import { api } from "./client";

export async function getSkillDemand() {
  const res = await api.get("/skills/demand");
  return res.data; // { demand, missingSkillPriority }
}
