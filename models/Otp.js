import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["login", "reset-password", "delete-account"],
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index — Mongo drops expired OTPs automatically, no cron job needed.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
