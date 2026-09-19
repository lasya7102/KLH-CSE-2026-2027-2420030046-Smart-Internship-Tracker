const mongoose = require("mongoose");
const { Schema } = mongoose;

const EVENT_TYPES = [
  "VIEW",
  "SEARCH",
  "CLICK",
  "SAVE",
  "APPLY",
  "REJECT",
  "SKILL_LEARNED",
  "RECOMMENDATION_CLICK",
];

const UserInteractionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    internship: { type: Schema.Types.ObjectId, ref: "Internship", default: null },
    eventType: { type: String, enum: EVENT_TYPES, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

UserInteractionSchema.index({ user: 1, createdAt: -1 });
UserInteractionSchema.index({ internship: 1, eventType: 1 });

UserInteractionSchema.statics.EVENT_TYPES = EVENT_TYPES;

module.exports = mongoose.model("UserInteraction", UserInteractionSchema);
