const request = require("supertest");
const { app, registerAndLogin } = require("./helpers");

describe("Skills", () => {
  test("adds a skill", async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app)
      .post("/api/users/skills")
      .set("Authorization", `Bearer ${token}`)
      .send({ skill: "AWS" });
    expect(res.status).toBe(201);
    expect(res.body.data.skills).toContain("AWS");
  });

  test("removes a skill, case-insensitively", async () => {
    const { token } = await registerAndLogin(request);
    await request(app).post("/api/users/skills").set("Authorization", `Bearer ${token}`).send({ skill: "Docker" });

    const res = await request(app)
      .delete("/api/users/skills/DOCKER")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.skills).not.toContain("Docker");
  });

  test("marks a skill as learning", async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app)
      .post("/api/users/learning-skills")
      .set("Authorization", `Bearer ${token}`)
      .send({ skill: "Kubernetes" });
    expect(res.status).toBe(201);
    expect(res.body.data.learningSkills).toContain("Kubernetes");
  });

  test("marking a learning skill as learned moves it to skills", async () => {
    const { token } = await registerAndLogin(request);
    await request(app)
      .post("/api/users/learning-skills")
      .set("Authorization", `Bearer ${token}`)
      .send({ skill: "GraphQL" });

    const res = await request(app)
      .post("/api/users/learning-skills/GraphQL/learn")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.skills).toContain("GraphQL");
    expect(res.body.data.learningSkills).not.toContain("GraphQL");
  });
});
