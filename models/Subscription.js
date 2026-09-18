import mongoose from "mongoose";

// A single plan-purchase request. Since payments are not wired up yet
// (testing period — see /pricing), every non-free purchase is created as
// "Pending" and an admin approves/holds/rejects it from /admin/plans.
const SubscriptionSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    plan: {
      type: String,
      required: true,
      enum: ["free", "standard", "premium"],
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    propertyLimit: {
      type: Number,
      default: null,
    },
    validityMonths: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Hold", "Rejected"],
      default: "Pending",
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
    decidedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
