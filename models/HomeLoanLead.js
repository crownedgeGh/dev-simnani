import mongoose from "mongoose";

// Leads captured from LoanEnquiryModal on the public /home-loan page.
// followups is the CRM log — every call/note the admin logs against the lead,
// with an optional date to come back to it.
const HomeLoanLeadSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, required: [true, "Phone is required"], trim: true },

    bankName: { type: String, trim: true, default: "" },
    bankRate: { type: Number, default: null },
    loanAmount: { type: Number, default: null },
    tenure: { type: Number, default: null },
    age: { type: Number, default: null },
    propertyIdentified: { type: String, enum: ["", "yes", "no"], default: "" },
    propertyCity: { type: String, trim: true, default: "" },
    propertyCost: { type: Number, default: null },
    employmentType: { type: String, enum: ["salaried", "self-employed"], default: "salaried" },
    income: { type: Number, default: null },
    currentEmi: { type: Number, default: null },

    status: {
      type: String,
      enum: ["New", "Contacted", "Follow-up", "Converted", "Lost"],
      default: "New",
      index: true,
    },
    nextFollowupDate: { type: String, default: "" },
    followups: {
      type: [
        {
          note: { type: String, trim: true, required: true },
          outcome: { type: String, trim: true, default: "" },
          date: {
            type: String,
            default: () =>
              new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
          },
          _id: false,
        },
      ],
      default: [],
    },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
  },
  { timestamps: true }
);

export default mongoose.models.HomeLoanLead || mongoose.model("HomeLoanLead", HomeLoanLeadSchema);
