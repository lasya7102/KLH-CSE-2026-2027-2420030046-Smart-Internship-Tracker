require("dotenv").config();
const createApp = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[server] Smart Internship Tracker API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
