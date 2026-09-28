import mongoose from "mongoose";

// A Field CP's self-tracked site visit: scheduled against a project they're
// assigned to, then walked through a Ready to Move -> Live Photo -> Visit
// Done timeline (each step timestamped) before being submitted as a report.
// Persisted so the portal survives a refresh mid-visit and the admin panel
// can inspect any Field CP's real visit history.
const SiteVisitSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fieldCpAccountId: {
      type: String,
      required: true,
      index: true,
    },
    projectId: { type: String, default: "" },
    project: { type: String, default: "" },
    customer: { type: String, default: "" },
    phone: { type: String, default: "" },
    scheduledAt: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Scheduled", "Moving", "Visit Done", "No Show"],
      default: "Scheduled",
    },
    movingAt: { type: Date, default: null },
    photoAt: { type: Date, default: null },
    doneAt: { type: Date, default: null },
    noShowAt: { type: Date, default: null },
    livePhotos: {
      type: [{ name: { type: String, default: "" }, url: { type: String, required: true } }],
      default: [],
    },
    notes: { type: String, default: "" },
    submitted: { type: Boolean, default: false },
    submittedAt: { type: Date, default: null },
    followUps: {
      type: [{ note: { type: String, required: true }, at: { type: String, default: "" } }],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.SiteVisit || mongoose.model("SiteVisit", SiteVisitSchema);
