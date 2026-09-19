const createApp = require("../src/app");

const app = createApp();

async function registerAndLogin(request, overrides = {}) {
  const payload = {
    name: "Test User",
    email: "test.user@example.com",
    password: "password123",
    college: "Test College",
    branch: "CSE",
    graduationYear: 2026,
    ...overrides,
  };
  const res = await request(app).post("/api/auth/register").send(payload);
  return { token: res.body.data.token, user: res.body.data.user, res };
}

module.exports = { app, registerAndLogin };
