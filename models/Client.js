import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Client phone is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    property: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "Active Negotiation",
    },
    lastActivity: {
      type: String,
      default: "Just now",
    },
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);
