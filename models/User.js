import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    accountType: {
      type: String,
      required: [true, "Account type is required"],
      enum: ["buyer", "broker", "investor", "freelancer", "common-person", "employee"],
      index: true,
    },
    status: {
      type: String,
      enum: ["Active", "Suspended", "Deleted"],
      default: "Active",
      index: true,
    },
    pendingVerification: {
      type: Boolean,
      default: false,
    },
    registeredDate: {
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

export default mongoose.models.User || mongoose.model("User", UserSchema);
