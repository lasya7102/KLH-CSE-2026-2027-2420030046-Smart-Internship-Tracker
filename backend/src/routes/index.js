const express = require("express");

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const internshipRoutes = require("./internship.routes");
const applicationRoutes = require("./application.routes");
const dashboardRoutes = require("./dashboard.routes");
const analyticsRoutes = require("./analytics.routes");
const recommendationRoutes = require("./recommendation.routes");
const skillRoutes = require("./skill.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/internships", internshipRoutes);
router.use("/applications", applicationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/skills", skillRoutes);

module.exports = router;
