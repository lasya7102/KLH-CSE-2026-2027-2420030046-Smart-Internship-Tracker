const mongoose = require("mongoose");
const { Schema } = mongoose;

const InternshipSchema = new Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: "" },
    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      default: "On-site",
    },
    // Kept as a display string ("₹45,000/mo") to match the frontend exactly,
    // plus a numeric field so the recommendation engine and filters can
    // actually compute against it.
    stipend: { type: String, trim: true, default: "" },
    stipendAmount: { type: Number, default: 0 },

    requiredSkills: [{ type: String, trim: true }],
    preferredSkills: [{ type: String, trim: true }],

    description: { type: String, trim: true, default: "" },

    deadline: { type: Date, default: null },
    oaDate: { type: Date, default: null },
    interviewDate: { type: Date, default: null },

    url: { type: String, trim: true, default: "" },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

InternshipSchema.index({ role: "text", company: "text", description: "text" });
InternshipSchema.index({ requiredSkills: 1 });
InternshipSchema.index({ location: 1 });
InternshipSchema.index({ deadline: 1 });
InternshipSchema.index({ isActive: 1 });
InternshipSchema.index({ company: 1, role: 1 });

module.exports = mongoose.model("Internship", InternshipSchema);
