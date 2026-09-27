import mongoose from "mongoose";

// Top-down property/project delegation, persisted in the database so it
// works across devices and browsers: Head CP -> Company CP
// (level "head-to-company"), then Company CP -> Field CP / Digital CP
// (level "company-to-field" / "company-to-digital"). `parentAssignmentId`
// chains a delegation back to the assignment it was delegated from.
const AssignmentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    propertyId: {
      type: String,
      required: true,
      index: true,
    },
    propertyTitle: { type: String, default: "" },
    propertyImage: { type: String, default: "" },
    propertyLocation: { type: String, default: "" },
    level: {
      type: String,
      required: true,
      enum: ["head-to-company", "company-to-field", "company-to-digital"],
      index: true,
    },
    assignedByCpType: {
      type: String,
      enum: ["head", "company"],
      default: "head",
    },
    assignedByAccountId: { type: String, default: "" },
    assignedByName: { type: String, default: "Head CP" },
    assignedByCity: { type: String, default: "" },
    assignedByState: { type: String, default: "" },
    assignedToCpType: {
      type: String,
      required: true,
      enum: ["company", "field", "digital"],
    },
    assignedToAccountId: {
      type: String,
      required: true,
      index: true,
    },
    assignedToName: { type: String, required: true },
    assignedToCity: { type: String, default: "" },
    assignedToState: { type: String, default: "" },
    parentAssignmentId: {
      type: String,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["Assigned", "In Progress", "Completed"],
      default: "Assigned",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
