const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/ApiResponse");
const Application = require("../models/Application");
const Internship = require("../models/Internship");
const UserInteraction = require("../models/UserInteraction");

// Status transitions that don't make sense are rejected (Section 6:
// "Validate status transitions where appropriate"). We keep this permissive
// but block moving backward out of a terminal state, since that's the one
// transition that's never legitimate for this workflow.
const TERMINAL_STATUSES = ["Selected", "Rejected"];

function assertValidTransition(current, next) {
  if (current === next) return; // no-op update is fine
  if (TERMINAL_STATUSES.includes(current)) {
    throw ApiError.badRequest(
      `Cannot change status from a terminal state ("${current}") to "${next}"`
    );
  }
}

// POST /api/applications
const createApplication = asyncHandler(async (req, res) => {
  const { internship, status, notes, oaDate, interviewDate } = req.body;

  const internshipDoc = await Internship.findById(internship);
  if (!internshipDoc || !internshipDoc.isActive) {
    throw ApiError.notFound("Internship not found");
  }

  const existing = await Application.findOne({ user: req.user._id, internship });
  if (existing) {
    throw ApiError.conflict("You have already applied to this internship");
  }

  const application = await Application.create({
    user: req.user._id,
    internship,
    status: status || "Applied",
    oaDate: oaDate || null,
    interviewDate: interviewDate || null,
    notes: notes || "",
  });

  await UserInteraction.create({
    user: req.user._id,
    internship,
    eventType: "APPLY",
  });

  const populated = await application.populate("internship");
  sendSuccess(res, 201, populated);
});

// GET /api/applications
const listApplications = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const applications = await Application.find(filter)
    .populate("internship")
    .sort("-createdAt")
    .lean();

  sendSuccess(res, 200, applications);
});

// GET /api/applications/:id
const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, user: req.user._id })
    .populate("internship")
    .lean();
  if (!application) throw ApiError.notFound("Application not found");
  sendSuccess(res, 200, application);
});

// PUT /api/applications/:id
const updateApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, user: req.user._id });
  if (!application) throw ApiError.notFound("Application not found");

  const allowed = ["notes", "oaDate", "interviewDate"];
  for (const field of allowed) {
    if (req.body[field] !== undefined) application[field] = req.body[field];
  }
  if (req.body.status !== undefined) {
    assertValidTransition(application.status, req.body.status);
    application.status = req.body.status;
  }

  await application.save();
  const populated = await application.populate("internship");
  sendSuccess(res, 200, populated);
});

// DELETE /api/applications/:id
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!application) throw ApiError.notFound("Application not found");
  sendSuccess(res, 200, { message: "Application removed" });
});

// PATCH /api/applications/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, user: req.user._id });
  if (!application) throw ApiError.notFound("Application not found");

  assertValidTransition(application.status, req.body.status);
  application.status = req.body.status;
  await application.save();

  if (req.body.status === "Rejected") {
    await UserInteraction.create({
      user: req.user._id,
      internship: application.internship,
      eventType: "REJECT",
    });
  }

  const populated = await application.populate("internship");
  sendSuccess(res, 200, populated);
});

module.exports = {
  createApplication,
  listApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  updateStatus,
};
