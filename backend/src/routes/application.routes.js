const express = require("express");
const ctrl = require("../controllers/application.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");
const {
  createApplicationRules,
  updateStatusRules,
} = require("../validators/application.validator");

const router = express.Router();
router.use(protect);

router.post("/", createApplicationRules, validate, ctrl.createApplication);
router.get("/", ctrl.listApplications);
router.get("/:id", ctrl.getApplication);
router.put("/:id", ctrl.updateApplication);
router.delete("/:id", ctrl.deleteApplication);
router.patch("/:id/status", updateStatusRules, validate, ctrl.updateStatus);

module.exports = router;
