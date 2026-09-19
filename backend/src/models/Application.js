const mongoose = require("mongoose");
const { Schema } = mongoose;

const STATUSES = ["Applied", "OA Pending", "Interview", "Selected", "Rejected"];

const ApplicationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    internship: { type: Schema.Types.ObjectId, ref: "Internship", required: true },
    status: { type: String, enum: STATUSES, default: "Applied" },
    appliedOn: { type: Date, default: Date.now },
    oaDate: { type: Date, default: null },
    interviewDate: { type: Date, default: null },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// A user cannot apply twice to the same internship.
ApplicationSchema.index({ user: 1, internship: 1 }, { unique: true });
ApplicationSchema.index({ user: 1, status: 1 });

ApplicationSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model("Application", ApplicationSchema);
