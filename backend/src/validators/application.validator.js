const { body } = require("express-validator");
const mongoose = require("mongoose");
const Application = require("../models/Application");

const createApplicationRules = [
  body("internship").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("internship must be a valid id");
    }
    return true;
  }),
  body("status").optional().isIn(Application.STATUSES),
];

const updateStatusRules = [
  body("status")
    .notEmpty()
    .withMessage("status is required")
    .isIn(Application.STATUSES)
    .withMessage(`status must be one of: ${Application.STATUSES.join(", ")}`),
];

module.exports = { createApplicationRules, updateStatusRules };
