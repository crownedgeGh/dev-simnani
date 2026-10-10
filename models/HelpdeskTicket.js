import mongoose from "mongoose";

const HelpdeskTicketSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accountId: {
      type: String,
      required: true,
      index: true,
    },
    userName: { type: String, trim: true, default: "" },
    userPhone: { type: String, trim: true, default: "" },
    userEmail: { type: String, trim: true, default: "" },
    accountType: { type: String, trim: true, default: "" },
    propertyId: { type: String, trim: true, default: "" },
    propertyTitle: { type: String, trim: true, default: "" },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Handled"],
      default: "Pending",
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

export default mongoose.models.HelpdeskTicket ||
  mongoose.model("HelpdeskTicket", HelpdeskTicketSchema);
