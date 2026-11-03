import mongoose from "mongoose";

// One record per successful /api/service-plans purchase — gives admins the
// full plan history (User.servicePlan* only holds the latest plan).
const ServicePlanPurchaseSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    price: { type: Number, required: true },
    // startsAt is in the future when bought before the previous plan expired.
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    razorpayPaymentId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.ServicePlanPurchase ||
  mongoose.model("ServicePlanPurchase", ServicePlanPurchaseSchema);
