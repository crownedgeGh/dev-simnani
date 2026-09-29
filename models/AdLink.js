import mongoose from "mongoose";

// A Digital CP's trackable ad/video link (Instagram, Facebook, YouTube,
// WhatsApp, Other) — leads logged under it reference this via
// CpLead.adLinkId.
const AdLinkSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    digitalCpAccountId: { type: String, required: true, index: true },
    platform: { type: String, required: true },
    link: { type: String, required: true },
    date: { type: String, default: "" },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.AdLink || mongoose.model("AdLink", AdLinkSchema);
