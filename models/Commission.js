import mongoose from "mongoose";

// A commission record created when a CpLead is marked "Converted" — approved
// or put on hold from the admin panel's Commissions tab.
const CommissionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    leadId: { type: String, required: true, index: true },
    customer: { type: String, default: "" },
    project: { type: String, default: "" },
    amount: { type: String, default: "Pending" },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "On Hold"],
      default: "Pending",
    },
    source: { type: String, default: "CP" },
    type: { type: String, default: "channel-partner" },
    cpType: { type: String, enum: ["digital", "field", "company"], index: true },
    cpAccountId: { type: String, default: "" },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.Commission || mongoose.model("Commission", CommissionSchema);
