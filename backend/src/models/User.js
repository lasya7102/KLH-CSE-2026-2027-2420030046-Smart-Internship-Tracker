const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    password: { type: String, required: true, minlength: 6, select: false },

    college: { type: String, trim: true, default: "" },
    branch: { type: String, trim: true, default: "" },
    graduationYear: { type: Number, default: null },

    // Skills the student currently has vs. is actively learning.
    // Stored with original casing but always compared case-insensitively
    // via src/utils/skillUtils.js.
    skills: [{ type: String, trim: true }],
    learningSkills: [{ type: String, trim: true }],

    // Preferences feed the recommendation engine (Section 10/11).
    preferredRoles: [{ type: String, trim: true }],
    preferredLocations: [{ type: String, trim: true }],
    preferredWorkMode: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site", "Any"],
      default: "Any",
    },
    preferredMinStipend: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

UserSchema.virtual("profileCompleteness").get(function computeCompleteness() {
  const fields = [
    this.name,
    this.college,
    this.branch,
    this.graduationYear,
    this.skills && this.skills.length > 0,
    this.preferredRoles && this.preferredRoles.length > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
});

UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

UserSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toPublicJSON = function toPublicJSON() {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
