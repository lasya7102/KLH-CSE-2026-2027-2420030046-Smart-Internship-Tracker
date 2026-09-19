const express = require("express");
const { getDemand } = require("../controllers/skill.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();
router.get("/demand", protect, getDemand);
module.exports = router;
