import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Property type is required"],
      enum: [
        "buy",
        "sell",
        "rent",
        "invest",
        "commercial",
        "farming",
        "industrial",
        "lease",
        "seized-property",
      ],
      default: "buy",
      index: true,
    },
    category: {
      type: String,
      default: "",
      index: true,
    },
    price: {
      type: String,
      required: [true, "Price is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      index: true,
    },
    beds: {
      type: Number,
      default: 0,
    },
    baths: {
      type: Number,
      default: 0,
    },
    area: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    badge: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["Active", "Pending Review", "Rejected"],
      default: "Active",
      index: true,
    },
    addedDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    purpose: { type: String, default: "sale" },
    propertyType: { type: String, default: "Flat" },
    rawPrice: { type: Number },
    negotiable: { type: String, default: "no" },
    locality: { type: String, default: "" },
    landmark: { type: String, default: "" },
    address: { type: String, default: "" },
    areaSize: { type: Number },
    areaUnit: { type: String, default: "sq ft" },
    floorNo: { type: String, default: "" },
    totalFloors: { type: Number },
    furnishing: { type: String, default: "Unfurnished" },
    parking: { type: String, default: "yes" },
    facing: { type: String, default: "" },
    availableFrom: { type: String, default: "" },
    preferredFor: { type: String, default: "Anyone" },
    galleryImages: { type: [String], default: [] },
    video: { type: String, default: "" },
    contact: {
      fullName: { type: String, default: "" },
      mobile: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.Property || mongoose.model("Property", PropertySchema);
