const rateLimit = require("express-rate-limit");

// Auth endpoints are the classic brute-force target, so they get a tighter
// limit than the rest of the API.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts from this IP, please try again later.",
    errors: [],
  },
});

module.exports = { authLimiter };
