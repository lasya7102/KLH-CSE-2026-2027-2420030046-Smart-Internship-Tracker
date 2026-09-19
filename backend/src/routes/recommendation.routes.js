const express = require("express");
const ctrl = require("../controllers/recommendation.controller");
const { protect } = require("../middleware/auth.middleware");
const { objectIdParam } = require("../validators/internship.validator");
const validate = require("../middleware/validation.middleware");

const router = express.Router();
router.use(protect);

router.get("/", ctrl.listRecommendations);
router.get("/:internshipId/explanation", objectIdParam("internshipId"), validate, ctrl.explainOne);
router.post("/:internshipId/interaction", objectIdParam("internshipId"), validate, ctrl.recordInteraction);

module.exports = router;
