import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Lead phone is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    propertyId: {
      // Leads forwarded down the CP chain are tied to a project, not always a
      // listing on this site — so they may arrive without a propertyId.
      // /api/leads still rejects enquiry leads that omit it.
      type: String,
      default: "",
      index: true,
    },
    interest: {
      type: String,
      default: "",
    },
    // Free-text requirement the visitor typed in on a service-provider callback form.
    requirement: {
      type: String,
      trim: true,
      default: "",
    },
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    buyerId: {
      type: String,
      default: "",
      index: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Site Visit"],
      default: "New",
    },
    source: {
      type: String,
      default: "Website",
    },
    // Set when a CP hands this lead to the account that owns it (Company CP ->
    // service provider today). Drives the "Forwarded by Company CP" badge.
    forwardedBy: {
      cpType: { type: String, enum: ["company", "field", "digital"] },
      name: { type: String, default: "" },
      accountId: { type: String, default: "" },
      _id: false,
    },
    callDone: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: [
        {
          text: { type: String, trim: true, required: true },
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
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
