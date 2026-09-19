const { body } = require("express-validator");

const updateProfileRules = [
  body("name").optional().trim().notEmpty(),
  body("email").optional().trim().isEmail(),
  body("college").optional().trim(),
  body("branch").optional().trim(),
  body("graduationYear").optional({ nullable: true }).isInt({ min: 2000, max: 2100 }),
  body("preferredRoles").optional().isArray(),
  body("preferredLocations").optional().isArray(),
  body("preferredWorkMode").optional().isIn(["Remote", "Hybrid", "On-site", "Any"]),
  body("preferredMinStipend").optional().isNumeric(),
];

const skillBodyRules = [
  body("skill").trim().notEmpty().withMessage("skill is required"),
];

module.exports = { updateProfileRules, skillBodyRules };
