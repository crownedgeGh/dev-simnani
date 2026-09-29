import mongoose from "mongoose";

// Single source of truth for every CP-originated lead — a Digital CP's ad
// link, a Field CP's direct lead, etc. `routingStage` tracks which CP
// dashboard currently owns it as it moves Digital/Field CP -> Head CP ->
// Company CP -> Field/Digital CP (see CPTypeWorkspace.jsx for the pipeline).
const CpLeadSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    project: { type: String, default: "" },
    projectId: { type: String, default: "" },
    source: { type: String, default: "" },
    submittedBy: {
      cpType: { type: String, enum: ["digital", "field", "company"] },
      name: { type: String, default: "" },
      accountId: { type: String, default: "", index: true },
      _id: false,
    },
    status: {
      type: String,
      enum: [
        "Pending Verification",
        "Verified",
        "Assigned",
        "Site Visit Scheduled",
        "Site Visit Completed",
        "Converted",
        "Lost",
      ],
      default: "Pending Verification",
    },
    // Draft leads (logged under a Digital CP's ad link, or a Field CP's
    // direct-lead form) start unforwarded and are only visible to the CP who
    // created them. Forwarding sets forwarded:true and hands routingStage to
    // "head-cp", entering the shared pipeline.
    forwarded: { type: Boolean, default: false },
    routingStage: {
      type: String,
      enum: ["digital-cp", "field-cp", "head-cp", "company-cp"],
      default: "digital-cp",
    },
    assignedTo: { type: String, default: "" },
    assignedToAccountId: { type: String, default: "" },
    adLinkId: { type: String, default: "", index: true },
    notes: { type: String, default: "" },
    date: { type: String, default: "" },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.CpLead || mongoose.model("CpLead", CpLeadSchema);
