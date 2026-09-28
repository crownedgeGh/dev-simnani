import mongoose from "mongoose";

const SkillCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    subcategories: {
      type: [String],
      default: [],
    },
    // true when the category itself was created via the "Add your own"
    // flow (freelancer registration or admin) rather than the seed list.
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.SkillCategory || mongoose.model("SkillCategory", SkillCategorySchema);
