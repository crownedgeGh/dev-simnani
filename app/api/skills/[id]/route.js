import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SkillCategory from "@/models/SkillCategory";
import { isAdminRequest } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Admin-only management: rename a category, replace its subcategory list,
// or remove a single subcategory.
export async function PATCH(request, { params }) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const category = await SkillCategory.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    if (typeof body.name === "string" && body.name.trim()) {
      category.name = body.name.trim();
    }

    if (Array.isArray(body.subcategories)) {
      category.subcategories = [...new Set(body.subcategories.map((s) => String(s).trim()).filter(Boolean))];
    }

    if (typeof body.addSubcategory === "string" && body.addSubcategory.trim()) {
      const value = body.addSubcategory.trim();
      if (!category.subcategories.some((s) => s.toLowerCase() === value.toLowerCase())) {
        category.subcategories.push(value);
      }
    }

    if (typeof body.removeSubcategory === "string") {
      category.subcategories = category.subcategories.filter(
        (s) => s.toLowerCase() !== body.removeSubcategory.trim().toLowerCase()
      );
    }

    await category.save();
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "A category with this name already exists" }, { status: 409 });
    }
    console.error("PATCH /api/skills/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const deleted = await SkillCategory.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    console.error("DELETE /api/skills/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
