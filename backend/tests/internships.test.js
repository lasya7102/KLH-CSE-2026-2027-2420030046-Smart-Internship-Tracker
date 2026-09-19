const request = require("supertest");
const { app, registerAndLogin } = require("./helpers");

async function createInternship(token, overrides = {}) {
  return request(app)
    .post("/api/internships")
    .set("Authorization", `Bearer ${token}`)
    .send({
      company: "TestCo",
      role: "Software Engineer Intern",
      requiredSkills: ["Java", "SQL"],
      deadline: "2026-12-01",
      ...overrides,
    });
}

describe("Internships", () => {
  test("creates an internship", async () => {
    const { token } = await registerAndLogin(request);
    const res = await createInternship(token);
    expect(res.status).toBe(201);
    expect(res.body.data.company).toBe("TestCo");
  });

  test("gets all internships with pagination envelope", async () => {
    const { token } = await registerAndLogin(request);
    await createInternship(token);
    await createInternship(token, { company: "Second Co" });

    const res = await request(app)
      .get("/api/internships?page=1&limit=1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.meta.pagination.total).toBe(2);
    expect(res.body.meta.pagination.totalPages).toBe(2);
  });

  test("gets internship by id, includes matchInfo", async () => {
    const { token } = await registerAndLogin(request, { skills: undefined });
    const created = await createInternship(token);
    const res = await request(app)
      .get(`/api/internships/${created.body.data._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.matchInfo).toBeDefined();
    expect(res.body.data.matchInfo.total).toBe(2);
  });

  test("updates an internship", async () => {
    const { token } = await registerAndLogin(request);
    const created = await createInternship(token);
    const res = await request(app)
      .put(`/api/internships/${created.body.data._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ role: "Updated Role" });
    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe("Updated Role");
  });

  test("soft-deletes an internship", async () => {
    const { token } = await registerAndLogin(request);
    const created = await createInternship(token);
    const del = await request(app)
      .delete(`/api/internships/${created.body.data._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);

    const get = await request(app)
      .get(`/api/internships/${created.body.data._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(get.status).toBe(404);
  });

  test("searches internships by keyword", async () => {
    const { token } = await registerAndLogin(request);
    await createInternship(token, { company: "SearchableCorp", role: "Backend Intern" });
    await createInternship(token, { company: "OtherCo", role: "Frontend Intern" });

    const res = await request(app)
      .get("/api/internships?search=Searchable")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].company).toBe("SearchableCorp");
  });

  test("rejects malformed ObjectId with 400, not a crash", async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app)
      .get("/api/internships/not-a-valid-id")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});
