const request = require("supertest");
const { app, registerAndLogin } = require("./helpers");

async function createInternship(token) {
  const res = await request(app)
    .post("/api/internships")
    .set("Authorization", `Bearer ${token}`)
    .send({ company: "AppCo", role: "Intern", requiredSkills: ["Java"], deadline: "2026-12-01" });
  return res.body.data._id;
}

describe("Applications", () => {
  test("creates an application", async () => {
    const { token } = await registerAndLogin(request);
    const internshipId = await createInternship(token);

    const res = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ internship: internshipId });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("Applied");
  });

  test("prevents duplicate applications to the same internship", async () => {
    const { token } = await registerAndLogin(request);
    const internshipId = await createInternship(token);

    await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ internship: internshipId });

    const res = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ internship: internshipId });

    expect(res.status).toBe(409);
  });

  test("updates application status via PATCH", async () => {
    const { token } = await registerAndLogin(request);
    const internshipId = await createInternship(token);
    const created = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ internship: internshipId });

    const res = await request(app)
      .patch(`/api/applications/${created.body.data._id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Interview" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("Interview");
  });

  test("rejects an invalid status value", async () => {
    const { token } = await registerAndLogin(request);
    const internshipId = await createInternship(token);
    const created = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ internship: internshipId });

    const res = await request(app)
      .patch(`/api/applications/${created.body.data._id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "NotAStatus" });

    expect(res.status).toBe(400);
  });

  test("blocks transitioning out of a terminal status", async () => {
    const { token } = await registerAndLogin(request);
    const internshipId = await createInternship(token);
    const created = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ internship: internshipId });

    await request(app)
      .patch(`/api/applications/${created.body.data._id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Selected" });

    const res = await request(app)
      .patch(`/api/applications/${created.body.data._id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Applied" });

    expect(res.status).toBe(400);
  });
});
