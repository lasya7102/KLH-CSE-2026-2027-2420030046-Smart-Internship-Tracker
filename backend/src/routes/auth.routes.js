const express = require("express");
const { register, login, me, logout } = require("../controllers/auth.controller");
const { registerRules, loginRules } = require("../validators/auth.validator");
const validate = require("../middleware/validation.middleware");
const { protect } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");

const router = express.Router();

router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);
router.get("/me", protect, me);
router.post("/logout", protect, logout);

module.exports = router;
