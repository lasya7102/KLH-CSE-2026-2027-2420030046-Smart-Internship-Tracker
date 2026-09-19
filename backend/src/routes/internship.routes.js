const express = require("express");
const ctrl = require("../controllers/internship.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");
const {
  createInternshipRules,
  updateInternshipRules,
  objectIdParam,
} = require("../validators/internship.validator");

const router = express.Router();
router.use(protect);

router.get("/", ctrl.listInternships);
router.post("/", createInternshipRules, validate, ctrl.createInternship);
router.get("/:id", objectIdParam(), validate, ctrl.getInternship);
router.put("/:id", objectIdParam(), updateInternshipRules, validate, ctrl.updateInternship);
router.delete("/:id", objectIdParam(), validate, ctrl.deleteInternship);
router.get("/:id/match", objectIdParam(), validate, ctrl.getInternshipMatch);

module.exports = router;
