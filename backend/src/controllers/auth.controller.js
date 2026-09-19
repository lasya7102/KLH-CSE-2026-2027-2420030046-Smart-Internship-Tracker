const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/ApiResponse");
const User = require("../models/User");
const { dedupeSkills } = require("../utils/skillUtils");

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, college, branch, graduationYear, skills } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    college,
    branch,
    graduationYear: graduationYear || null,
    skills: dedupeSkills(skills || []),
  });

  const token = signToken(user._id);
  sendSuccess(res, 201, { user: user.toPublicJSON(), token });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken(user._id);
  sendSuccess(res, 200, { user: user.toPublicJSON(), token });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user.toPublicJSON() });
});

// POST /api/auth/logout
// JWTs are stateless, so "logout" is a client-side token discard. This
// endpoint exists so the frontend has a consistent call to make and so a
// server-side token blocklist could be added later without changing the API.
const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { message: "Logged out" });
});

module.exports = { register, login, me, logout };
