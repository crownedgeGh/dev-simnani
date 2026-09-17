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
    password: {
      type: String,
      select: false,
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    cpType: {
      type: String,
      enum: ["company", "digital", "field"],
    },
    // Channel Partners get portal access immediately by default; an admin
    // can only place them on hold (blocks portal access) — rejecting a
    // registration deletes the user record outright rather than flagging it.
    cpApprovalStatus: {
      type: String,
      enum: ["active", "hold"],
      default: "active",
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
    reraRegistered: {
      type: Boolean,
      default: function () {
        return this.accountType === "broker" ? true : undefined;
      },
    },
    reraNumber: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.accountType === "broker" && this.reraRegistered === true;
        },
        "RERA registration number is required for brokers",
      ],
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
    savedProperties: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
