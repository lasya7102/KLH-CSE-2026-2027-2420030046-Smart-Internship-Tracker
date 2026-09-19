const request = require("supertest");
const { app, registerAndLogin } = require("./helpers");
const Internship = require("../src/models/Internship");
const Application = require("../src/models/Application");
const UserInteraction = require("../src/models/UserInteraction");

async function seedInternships(overrides = []) {
  const base = [
    { company: "GoodMatch Inc", role: "Backend Intern", requiredSkills: ["Java", "SQL"], deadline: "2026-12-01" },
    { company: "PartialMatch Inc", role: "Data Intern", requiredSkills: ["Python", "AWS"], deadline: "2026-12-05" },
    { company: "NoMatch Inc", role: "Design Intern", requiredSkills: ["Figma"], deadline: "2026-12-10" },
    { company: "Expired Inc", role: "Old Intern", requiredSkills: ["Java"], deadline: "2020-01-01" },
  ];
  const docs = await Internship.insertMany([...base, ...overrides]);
  return docs;
}

describe("Recommendation system", () => {
  test("cold-start user (no interactions) still gets ranked recommendations", async () => {
    const { token } = await registerAndLogin(request, { skills: ["Java", "SQL"] });
    await seedInternships();

    const res = await request(app)
      .get("/api/recommendations?limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.meta.usingBehavioralModel).toBe(false);
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    // Best skill match should rank at or near the top.
    expect(res.body.data.recommendations[0].internship.company).toBe("GoodMatch Inc");
  });

  test("excludes expired internships", async () => {
    const { token } = await registerAndLogin(request, { skills: ["Java"] });
    await seedInternships();

    const res = await request(app)
      .get("/api/recommendations?limit=10")
      .set("Authorization", `Bearer ${token}`);

    const companies = res.body.data.recommendations.map((r) => r.internship.company);
    expect(companies).not.toContain("Expired Inc");
  });

  test("excludes internships the user already rejected", async () => {
    const { token, user } = await registerAndLogin(request, { skills: ["Java", "SQL"] });
    const [goodMatch] = await seedInternships();

    await UserInteraction.create({ user: user._id, internship: goodMatch._id, eventType: "REJECT" });

    const res = await request(app)
      .get("/api/recommendations?limit=10")
      .set("Authorization", `Bearer ${token}`);

    const companies = res.body.data.recommendations.map((r) => r.internship.company);
    expect(companies).not.toContain("GoodMatch Inc");
  });

  test("excludes internships the user already applied to", async () => {
    const { token, user } = await registerAndLogin(request, { skills: ["Java", "SQL"] });
    const [goodMatch] = await seedInternships();

    await Application.create({ user: user._id, internship: goodMatch._id, status: "Applied" });

    const res = await request(app)
      .get("/api/recommendations?limit=10")
      .set("Authorization", `Bearer ${token}`);

    const companies = res.body.data.recommendations.map((r) => r.internship.company);
    expect(companies).not.toContain("GoodMatch Inc");
  });

  test("recommendation explanation includes reasons and matched/missing skills", async () => {
    const { token } = await registerAndLogin(request, { skills: ["Java", "SQL"] });
    const [goodMatch] = await seedInternships();

    const res = await request(app)
      .get(`/api/recommendations/${goodMatch._id}/explanation`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.reasons.length).toBeGreaterThan(0);
    expect(res.body.data.matchedSkills).toEqual(expect.arrayContaining(["Java", "SQL"]));
    expect(res.body.data.matchPercentage).toBe(100);
  });

  test("switches on behavioral model once enough interactions exist", async () => {
    const { token, user } = await registerAndLogin(request, { skills: ["Java", "SQL"] });
    const docs = await seedInternships();

    // Generate >= MIN_INTERACTIONS_FOR_BEHAVIOR (default 5) interactions.
    const events = docs.flatMap((d) => [
      { user: user._id, internship: d._id, eventType: "VIEW" },
      { user: user._id, internship: d._id, eventType: "CLICK" },
    ]);
    await UserInteraction.insertMany(events);

    const res = await request(app)
      .get("/api/recommendations")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.meta.usingBehavioralModel).toBe(true);
  });
});
