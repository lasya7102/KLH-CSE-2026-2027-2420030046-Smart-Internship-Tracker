const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const createInternshipRules = [
  body("company").trim().notEmpty().withMessage("Company is required"),
  body("role").trim().notEmpty().withMessage("Role is required"),
  body("requiredSkills")
    .isArray({ min: 1 })
    .withMessage("requiredSkills must be a non-empty array"),
  body("deadline")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("deadline must be a valid date"),
  body("workMode").optional().isIn(["Remote", "Hybrid", "On-site"]),
  body("url").optional({ nullable: true, checkFalsy: true }).isURL().withMessage("url must be valid"),
];

const updateInternshipRules = [
  body("company").optional().trim().notEmpty(),
  body("role").optional().trim().notEmpty(),
  body("requiredSkills").optional().isArray(),
  body("deadline").optional({ nullable: true }).isISO8601(),
  body("workMode").optional().isIn(["Remote", "Hybrid", "On-site"]),
];

const objectIdParam = (name = "id") => [
  param(name).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`${name} must be a valid id`);
    }
    return true;
  }),
];

module.exports = { createInternshipRules, updateInternshipRules, objectIdParam };
