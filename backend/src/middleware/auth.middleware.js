const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

// Verifies the Bearer token and attaches the full user document to req.user.
// Any route behind this middleware can assume req.user exists and is fresh.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw ApiError.unauthorized("No authentication token provided");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw ApiError.unauthorized("User for this token no longer exists");
  }

  req.user = user;
  req.userId = user._id;
  next();
});

// Placeholder for role-based authorization — internships in this app are
// user-owned (createdBy), so most authorization checks happen per-resource
// in the controller, but this is here so the architecture supports roles.
function authorizeOwner(getOwnerId) {
  return (req, res, next) => {
    const ownerId = getOwnerId(req);
    if (ownerId && String(ownerId) !== String(req.userId)) {
      return next(ApiError.forbidden("You do not have access to this resource"));
    }
    next();
  };
}

module.exports = { protect, authorizeOwner };
