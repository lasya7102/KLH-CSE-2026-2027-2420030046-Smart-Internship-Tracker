const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/ApiResponse");
const User = require("../models/User");
const UserInteraction = require("../models/UserInteraction");
const {
  dedupeSkills,
  includesSkill,
  removeSkill: removeSkillFromList,
  skillKey,
} = require("../utils/skillUtils");

// GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user.toPublicJSON() });
});

// PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "name",
    "email",
    "college",
    "branch",
    "graduationYear",
    "preferredRoles",
    "preferredLocations",
    "preferredWorkMode",
    "preferredMinStipend",
  ];

  for (const field of allowed) {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  }

  await req.user.save();
  sendSuccess(res, 200, { user: req.user.toPublicJSON() });
});

// GET /api/users/skills
const getSkills = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { skills: req.user.skills });
});

// POST /api/users/skills
const addSkill = asyncHandler(async (req, res) => {
  const { skill } = req.body;
  req.user.skills = dedupeSkills([...req.user.skills, skill]);
  // Adding a skill directly always "resolves" it out of learning, mirroring
  // the frontend's addSkill() behavior.
  req.user.learningSkills = removeSkillFromList(req.user.learningSkills, skill);
  await req.user.save();
  sendSuccess(res, 201, { skills: req.user.skills, learningSkills: req.user.learningSkills });
});

// DELETE /api/users/skills/:skill
const deleteSkill = asyncHandler(async (req, res) => {
  const { skill } = req.params;
  req.user.skills = removeSkillFromList(req.user.skills, skill);
  await req.user.save();
  sendSuccess(res, 200, { skills: req.user.skills });
});

// GET /api/users/learning-skills
const getLearningSkills = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { learningSkills: req.user.learningSkills });
});

// POST /api/users/learning-skills
const addLearningSkill = asyncHandler(async (req, res) => {
  const { skill } = req.body;
  // Don't add as "learning" if it's already a possessed skill.
  if (includesSkill(req.user.skills, skill)) {
    throw ApiError.conflict("This skill is already in your possessed skills");
  }
  req.user.learningSkills = dedupeSkills([...req.user.learningSkills, skill]);
  await req.user.save();
  sendSuccess(res, 201, { learningSkills: req.user.learningSkills });
});

// DELETE /api/users/learning-skills/:skill
const deleteLearningSkill = asyncHandler(async (req, res) => {
  const { skill } = req.params;
  req.user.learningSkills = removeSkillFromList(req.user.learningSkills, skill);
  await req.user.save();
  sendSuccess(res, 200, { learningSkills: req.user.learningSkills });
});

// POST /api/users/learning-skills/:skill/learn
// Promotes a learning skill to a fully possessed skill (Section 4 flow):
// 1. remove from learningSkills, 2. add to skills, 3. no duplicates,
// 4. log a SKILL_LEARNED interaction so the recommendation engine can react.
const markSkillLearned = asyncHandler(async (req, res) => {
  const { skill } = req.params;

  req.user.learningSkills = removeSkillFromList(req.user.learningSkills, skill);
  req.user.skills = dedupeSkills([...req.user.skills, skill]);
  await req.user.save();

  await UserInteraction.create({
    user: req.user._id,
    eventType: "SKILL_LEARNED",
    metadata: { skill: skillKey(skill) },
  });

  sendSuccess(res, 200, { skills: req.user.skills, learningSkills: req.user.learningSkills });
});

module.exports = {
  getProfile,
  updateProfile,
  getSkills,
  addSkill,
  deleteSkill,
  getLearningSkills,
  addLearningSkill,
  deleteLearningSkill,
  markSkillLearned,
};
