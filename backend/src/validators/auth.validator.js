const { body } = require("express-validator");

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("college").optional().trim(),
  body("branch").optional().trim(),
  body("graduationYear")
    .optional({ nullable: true })
    .isInt({ min: 2000, max: 2100 })
    .withMessage("graduationYear must be a valid year"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { registerRules, loginRules };
