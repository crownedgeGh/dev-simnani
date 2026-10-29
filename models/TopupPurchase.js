import mongoose from "mongoose";

// One record per successful /api/topup purchase — lets admins see a
// broker's topup history, not just the current running credit total
// (User.topupCredits).
const TopupPurchaseSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true, index: true },
    topupId: { type: String, required: true },
    listings: { type: Number, required: true },
    price: { type: Number, required: true },
    razorpayPaymentId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.TopupPurchase ||
  mongoose.model("TopupPurchase", TopupPurchaseSchema);
