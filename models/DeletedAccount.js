import mongoose from "mongoose";

// Archive of a self-deleted account. The live User doc (and every record it
// owned — see app/api/account/delete/route.js) is hard-deleted so the mobile
// number is free again and the person must sign up fresh; this snapshot is
// the only remaining trace, kept for admin record-keeping.
const DeletedAccountSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true, index: true },
    fullName: { type: String, default: "" },
    mobile: { type: String, default: "", index: true },
    email: { type: String, default: "" },
    accountType: { type: String, default: "" },
    deletedAt: { type: Date, default: Date.now },
    snapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.DeletedAccount || mongoose.model("DeletedAccount", DeletedAccountSchema);
