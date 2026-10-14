import mongoose from "mongoose";
import { DEFAULT_PROJECT, FACINGS, PLOT_STATUSES } from "@/lib/plotInventory";

// One plot in a layout (e.g. "F-32" in T&C RERA). block/seq are derived from
// plotNumber by the API so the grid can sort E-2 before E-10.
const PlotSchema = new mongoose.Schema(
  {
    project: { type: String, required: true, trim: true, default: DEFAULT_PROJECT, index: true },
    plotNumber: { type: String, required: true, trim: true, uppercase: true },
    block: { type: String, required: true, trim: true, uppercase: true },
    seq: { type: Number, default: 0 },

    lengthFt: { type: Number, default: 0, min: 0 },
    widthFt: { type: Number, default: 0, min: 0 },
    areaSqft: { type: Number, default: 0, min: 0 },
    facing: { type: String, enum: ["", ...FACINGS], default: "" },
    isCorner: { type: Boolean, default: false },

    ratePerSqft: { type: Number, default: 0, min: 0 },
    // PLC / corner premium / development charges on top of area × rate.
    extraCharges: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, default: 0, min: 0 },

    status: { type: String, enum: PLOT_STATUSES, default: "available", index: true },
    buyerName: { type: String, trim: true, default: "" },
    buyerPhone: { type: String, trim: true, default: "" },
    bookingDate: { type: Date, default: null },
    tokenAmount: { type: Number, default: 0, min: 0 },
    reraRegNo: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

PlotSchema.index({ project: 1, plotNumber: 1 }, { unique: true });

export default mongoose.models.Plot || mongoose.model("Plot", PlotSchema);
