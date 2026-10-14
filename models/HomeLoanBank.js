import mongoose from "mongoose";

const HomeLoanBankSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Bank name is required"], trim: true },
    logo: { type: String, required: [true, "Logo URL is required"], trim: true },
    rate: { type: Number, required: [true, "Rate of interest is required"] },
    fee: { type: Number, required: [true, "Processing fee is required"] },
    tenureMin: { type: Number, required: true, default: 1 },
    tenureMax: { type: Number, required: true, default: 30 },
    featured: { type: Boolean, default: false },
    knowMoreHref: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.HomeLoanBank || mongoose.model("HomeLoanBank", HomeLoanBankSchema);
