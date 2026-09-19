const express = require("express");
const ctrl = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");
const { updateProfileRules, skillBodyRules } = require("../validators/user.validator");

const router = express.Router();
router.use(protect);

router.get("/profile", ctrl.getProfile);
router.put("/profile", updateProfileRules, validate, ctrl.updateProfile);

router.get("/skills", ctrl.getSkills);
router.post("/skills", skillBodyRules, validate, ctrl.addSkill);
router.delete("/skills/:skill", ctrl.deleteSkill);

router.get("/learning-skills", ctrl.getLearningSkills);
router.post("/learning-skills", skillBodyRules, validate, ctrl.addLearningSkill);
router.delete("/learning-skills/:skill", ctrl.deleteLearningSkill);
router.post("/learning-skills/:skill/learn", ctrl.markSkillLearned);

module.exports = router;
