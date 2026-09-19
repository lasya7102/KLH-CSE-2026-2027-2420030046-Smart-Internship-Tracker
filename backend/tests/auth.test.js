const request = require("supertest");
const { app, registerAndLogin } = require("./helpers");

describe("Auth", () => {
  test("registers a new user", async () => {
    const { res } = await registerAndLogin(request);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.token).toBeTruthy();
  });

  test("rejects duplicate email registration with 409", async () => {
    await registerAndLogin(request);
    const res = await request(app).post("/api/auth/register").send({
      name: "Another",
      email: "test.user@example.com",
      password: "password123",
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("logs in with correct credentials", async () => {
    await registerAndLogin(request);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test.user@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
  });

  test("rejects login with invalid password", async () => {
    await registerAndLogin(request);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test.user@example.com", password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  test("protected endpoint rejects requests with no token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("protected endpoint accepts a valid token", async () => {
    const { token } = await registerAndLogin(request);
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("test.user@example.com");
  });
});
