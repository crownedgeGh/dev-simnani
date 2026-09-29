import mongoose from "mongoose";

// Creative a Digital CP submits for an assigned project, moderated by their
// Company CP (Approve / Suggest Edit / Reject) from the portal, and visible
// read-only from the admin Digital CP Management page.
const CampaignVideoSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    partnerAccountId: { type: String, required: true, index: true },
    partnerName: { type: String, required: true },
    partnerCpType: { type: String, enum: ["digital"], default: "digital" },
    project: { type: String, default: "" },
    projectId: { type: String, default: "" },
    videoName: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending Review", "Approved", "Suggested Edit", "Rejected"],
      default: "Pending Review",
    },
    note: { type: String, default: "" },
    postedLinks: {
      type: [{ platform: { type: String, default: "" }, url: { type: String, required: true }, _id: false }],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.CampaignVideo || mongoose.model("CampaignVideo", CampaignVideoSchema);
