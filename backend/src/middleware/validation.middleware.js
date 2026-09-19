const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// Runs after an express-validator chain; converts field errors into the
// project's standard 400 response shape instead of letting each controller
// re-implement this check.
function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => `${e.path}: ${e.msg}`);
  next(ApiError.badRequest("Validation failed", errors));
}

module.exports = validate;
