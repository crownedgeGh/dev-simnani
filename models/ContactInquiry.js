import mongoose from "mongoose";

const ContactInquirySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    userType: {
      type: String,
      enum: ["buyer", "tenant", "agent", "investor", "other"],
      default: "buyer",
    },
    source: {
      // Which page/property they submitted from
      type: String,
      trim: true,
      default: "Website",
    },
    propertyTitle: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Closed"],
      default: "New",
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

export default mongoose.models.ContactInquiry ||
  mongoose.model("ContactInquiry", ContactInquirySchema);
