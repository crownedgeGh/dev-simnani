import mongoose from "mongoose";

// Codes generated in the admin CP workspace for a specific CP type, meant to
// be redeemed on the public freelancer registration form.
const InvitationCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    cpType: { type: String, enum: ["company", "digital", "field"], required: true, index: true },
    name: { type: String, default: "" },
    mobile: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    address: { type: String, default: "" },
    used: { type: Boolean, default: false },
    usedBy: { type: String, default: "" },
    usedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.InvitationCode || mongoose.model("InvitationCode", InvitationCodeSchema);
