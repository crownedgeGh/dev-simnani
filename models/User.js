import mongoose from "mongoose";
import { SERVICE_PROVIDER_TYPE_VALUES } from "@/lib/serviceProviders";

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
      unique: true,
      index: true,
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
    // Field/Digital CP's chosen Company CP (same city) — leads they add get
    // forwarded straight to this CP instead of the usual head-cp routing.
    selectedCompanyCpId: {
      type: String,
      default: "",
    },
    selectedCompanyCpName: {
      type: String,
      default: "",
    },
    // Service Provider sub-type — required for accountType "service-provider"
    // (see lib/serviceProviders.js).
    serviceType: {
      type: String,
      enum: SERVICE_PROVIDER_TYPE_VALUES,
      required: [
        function () {
          return this.accountType === "service-provider";
        },
        "Service type is required for service providers",
      ],
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      required: [
        function () {
          return this.accountType === "service-provider";
        },
        "Years of experience is required for service providers",
      ],
    },
    // Channel Partners get portal access immediately by default. Self-
    // registered Company CPs start on "hold" until Head CP approves them
    // (see PendingCpApprovals) — admin can also place any CP on hold later;
    // rejecting a registration deletes the user record outright instead.
    cpApprovalStatus: {
      type: String,
      enum: ["active", "hold"],
      default: "active",
    },
    accountType: {
      type: String,
      required: [true, "Account type is required"],
      enum: [
        "buyer",
        "broker",
        "investor",
        "freelancer",
        "owner",
        "employee",
        "builder",
        "service-provider",
      ],
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
    dealsClosed: {
      type: Number,
      default: 0,
      min: 0,
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
    // Membership plan — set on purchase (see /pricing + /api/subscriptions).
    // Every plan is auto-approved and active immediately on purchase. An
    // admin can still move a subscription to "hold"/"rejected" from
    // /admin/plans, and "pending" remains for that legacy transitional state.
    plan: {
      type: String,
      enum: ["free", "standard", "premium"],
      default: "free",
    },
    planStatus: {
      type: String,
      enum: ["active", "pending", "hold", "rejected"],
      default: "active",
    },
    planPropertyLimit: {
      type: Number,
      default: 10,
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    planSubscriptionId: {
      type: String,
      default: null,
    },
    // Extra listing credits bought on /topup, stacked on top of the base
    // listing limit — see lib/topups.js + /api/topup.
    topupCredits: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Homepage broker showcase — admin-controlled, only meaningful for
    // brokers on the "premium" plan (see /admin/brokers/featured).
    isFeaturedBroker: {
      type: Boolean,
      default: false,
    },
    featuredPosition: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },
    // Freelancer skills — each entry pairs a SkillCategory name with one of
    // its subcategories (see /api/skills, models/SkillCategory.js).
    skills: {
      type: [
        {
          category: { type: String, trim: true },
          subcategory: { type: String, trim: true },
          _id: false,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
