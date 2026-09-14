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
      type: String,
      required: true,
      index: true,
    },
    interest: {
      type: String,
      default: "",
    },
    ownerId: {
      type: String,
      required: true,
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
