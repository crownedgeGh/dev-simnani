import mongoose from "mongoose";
import { SERVICE_PROVIDER_TYPE_VALUES } from "@/lib/serviceProviders";

// Callback requests raised from a service-provider section (/farming,
// /industrial, /properties, /commercial). serviceType records which role the
// visitor was looking at, so admin sees "Agri Infrastructure Developer" for a
// request that came off a farming land page.
const ContractorLeadSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: [true, "Name is required"], trim: true },
    phone: { type: String, required: [true, "Phone is required"], trim: true },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    bestTime: {
      type: String,
      enum: ["", "morning", "afternoon", "evening"],
      default: "",
    },
    serviceType: {
      type: String,
      enum: SERVICE_PROVIDER_TYPE_VALUES,
      required: [true, "Service type is required"],
      index: true,
    },
    // Page the request was raised from, e.g. "/farming/orchards".
    sourcePath: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["New", "Contacted", "Closed"],
      default: "New",
      index: true,
    },
    adminNotes: { type: String, trim: true, default: "" },
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
  { timestamps: true },
);

export default mongoose.models.ContractorLead ||
  mongoose.model("ContractorLead", ContractorLeadSchema);
