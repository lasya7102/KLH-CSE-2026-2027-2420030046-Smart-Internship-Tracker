const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/ApiResponse");
const Internship = require("../models/Internship");
const UserInteraction = require("../models/UserInteraction");
const { computeMatch } = require("../services/matching/skillMatch.service");
const { parseStipendAmount } = require("../services/matching/stipendParse.util");

// GET /api/internships
// Supports: search, status, role, location, workMode, skills, page, limit, sort
// NOTE: `status` here filters by the requesting user's Application status for
// that internship (the frontend treats "status" as an application-tracking
// field). If the user has no application for an internship, it only shows
// under the implicit "not yet applied" bucket (i.e. status filter is skipped
// for internships with no application).
const listInternships = asyncHandler(async (req, res) => {
  const {
    search,
    role,
    location,
    workMode,
    skills,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query;

  const filter = { isActive: true };

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { company: regex },
      { role: regex },
      { description: regex },
      { location: regex },
      { requiredSkills: regex },
    ];
  }
  if (role) filter.role = new RegExp(role, "i");
  if (location) filter.location = new RegExp(location, "i");
  if (workMode) filter.workMode = workMode;
  if (skills) {
    const skillList = String(skills).split(",").map((s) => s.trim()).filter(Boolean);
    if (skillList.length) {
      filter.requiredSkills = { $in: skillList.map((s) => new RegExp(`^${s}$`, "i")) };
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

  const [items, total] = await Promise.all([
    Internship.find(filter)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Internship.countDocuments(filter),
  ]);

  const studentSkills = req.user ? req.user.skills : [];
  const data = items.map((internship) => ({
    ...internship,
    matchInfo: computeMatch(internship.requiredSkills, studentSkills),
  }));

  sendSuccess(res, 200, data, {
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

// GET /api/internships/:id
const getInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id).lean();
  if (!internship || !internship.isActive) {
    throw ApiError.notFound("Internship not found");
  }

  const matchInfo = computeMatch(internship.requiredSkills, req.user.skills);

  // Record a VIEW interaction (fire-and-forget, doesn't block the response).
  UserInteraction.create({
    user: req.user._id,
    internship: internship._id,
    eventType: "VIEW",
  }).catch(() => {});

  sendSuccess(res, 200, { ...internship, matchInfo });
});

// POST /api/internships
const createInternship = asyncHandler(async (req, res) => {
  const body = req.body;
  const stipendAmount = parseStipendAmount(body.stipend);

  const internship = await Internship.create({
    company: body.company,
    role: body.role,
    location: body.location || "",
    workMode: body.workMode || "On-site",
    stipend: body.stipend || "",
    stipendAmount,
    requiredSkills: body.requiredSkills || [],
    preferredSkills: body.preferredSkills || [],
    description: body.description || "",
    deadline: body.deadline || null,
    oaDate: body.oaDate || null,
    interviewDate: body.interviewDate || null,
    url: body.url || "",
    createdBy: req.user._id,
  });

  sendSuccess(res, 201, internship);
});

// PUT /api/internships/:id
const updateInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) throw ApiError.notFound("Internship not found");

  const allowed = [
    "company",
    "role",
    "location",
    "workMode",
    "stipend",
    "requiredSkills",
    "preferredSkills",
    "description",
    "deadline",
    "oaDate",
    "interviewDate",
    "url",
    "isActive",
  ];
  for (const field of allowed) {
    if (req.body[field] !== undefined) internship[field] = req.body[field];
  }
  if (req.body.stipend !== undefined) {
    internship.stipendAmount = parseStipendAmount(req.body.stipend);
  }

  await internship.save();
  sendSuccess(res, 200, internship);
});

// DELETE /api/internships/:id
const deleteInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) throw ApiError.notFound("Internship not found");
  // Soft delete: keeps Application/UserInteraction history intact.
  internship.isActive = false;
  await internship.save();
  sendSuccess(res, 200, { message: "Internship removed" });
});

// GET /api/internships/:id/match
const getInternshipMatch = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id).lean();
  if (!internship || !internship.isActive) throw ApiError.notFound("Internship not found");

  const matchInfo = computeMatch(internship.requiredSkills, req.user.skills);
  sendSuccess(res, 200, matchInfo);
});

module.exports = {
  listInternships,
  getInternship,
  createInternship,
  updateInternship,
  deleteInternship,
  getInternshipMatch,
};
