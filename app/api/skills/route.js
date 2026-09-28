import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SkillCategory from "@/models/SkillCategory";
import { SKILL_CATEGORIES_SEED } from "@/lib/skillCategoriesSeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    const count = await SkillCategory.countDocuments();
    if (count === 0) {
      await SkillCategory.insertMany(
        SKILL_CATEGORIES_SEED.map((c) => ({ ...c, isCustom: false }))
      );
    } else {
      // Ensure existing categories have all baseline seed subcategories
      for (const seed of SKILL_CATEGORIES_SEED) {
        await SkillCategory.updateOne(
          { name: { $regex: `^${escapeRegex(seed.name)}$`, $options: "i" }, isCustom: { $ne: true } },
          { $set: { subcategories: seed.subcategories } }
        );
      }
    }

    const categories = await SkillCategory.find({}).sort({ name: 1 }).lean();

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET /api/skills error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch skill categories" },
      { status: 500 }
    );
  }
}

// "Add your own" — used by both the freelancer registration wizard and the
// admin skills panel. Two shapes:
//   { type: "category", name }                     -> creates a new category
//   { type: "subcategory", category, subcategory }  -> appends to an existing (or new) category
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const type = body.type;

    if (type === "category") {
      const name = (body.name || "").trim();
      if (!name) {
        return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
      }

      const existing = await SkillCategory.findOne({ name: { $regex: `^${escapeRegex(name)}$`, $options: "i" } });
      if (existing) {
        return NextResponse.json({ success: true, data: existing });
      }

      const created = await SkillCategory.create({ name, subcategories: [], isCustom: true });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    if (type === "subcategory") {
      const categoryName = (body.category || "").trim();
      const subcategory = (body.subcategory || "").trim();
      if (!categoryName || !subcategory) {
        return NextResponse.json(
          { success: false, error: "category and subcategory are required" },
          { status: 400 }
        );
      }

      let category = await SkillCategory.findOne({
        name: { $regex: `^${escapeRegex(categoryName)}$`, $options: "i" },
      });

      if (!category) {
        category = await SkillCategory.create({ name: categoryName, subcategories: [], isCustom: true });
      }

      const alreadyExists = category.subcategories.some(
        (s) => s.toLowerCase() === subcategory.toLowerCase()
      );
      if (!alreadyExists) {
        category.subcategories.push(subcategory);
        await category.save();
      }

      return NextResponse.json({ success: true, data: category }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: "Invalid type — expected 'category' or 'subcategory'" }, { status: 400 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "That category already exists" }, { status: 409 });
    }
    console.error("POST /api/skills error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const categoryName = (searchParams.get("category") || "").trim();
    const subcategory = (searchParams.get("subcategory") || "").trim();

    if (!categoryName || !subcategory) {
      return NextResponse.json(
        { success: false, error: "category and subcategory are required" },
        { status: 400 }
      );
    }

    const category = await SkillCategory.findOne({
      name: { $regex: `^${escapeRegex(categoryName)}$`, $options: "i" },
    });

    if (category) {
      category.subcategories = category.subcategories.filter(
        (s) => s.toLowerCase() !== subcategory.toLowerCase()
      );
      await category.save();
      return NextResponse.json({ success: true, data: category });
    }

    return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
  } catch (error) {
    console.error("DELETE /api/skills error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete skill" },
      { status: 500 }
    );
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

