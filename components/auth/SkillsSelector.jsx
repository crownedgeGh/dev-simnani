"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MdAdd, MdClose, MdKeyboardArrowDown, MdSearch, MdCheck } from "react-icons/md";
import { inputClass } from "./inputStyles";
import { SKILL_CATEGORIES_SEED } from "@/lib/skillCategoriesSeed";

function dedupeCategories(list) {
  const map = new Map();
  for (const item of list || []) {
    if (!item?.name) continue;
    const trimmedName = item.name.trim();
    const key = trimmedName.toLowerCase();
    const subs = Array.isArray(item.subcategories) ? item.subcategories : [];

    if (!map.has(key)) {
      map.set(key, {
        ...item,
        name: trimmedName,
        subcategories: Array.from(new Set(subs.map((s) => s.trim()))),
      });
    } else {
      const existing = map.get(key);
      const combined = [...(existing.subcategories || []), ...subs.map((s) => s.trim())];
      existing.subcategories = Array.from(new Set(combined));
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default function SkillsSelector({ value = [], onChange }) {
  const [categories, setCategories] = useState(() => dedupeCategories(SKILL_CATEGORIES_SEED));
  const [loading, setLoading] = useState(true);

  // Category state (initialized from value if already present)
  const initialCategory = value.length > 0 && value[0]?.category ? value[0].category : "";
  const [categoryQuery, setCategoryQuery] = useState(initialCategory);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isCatOpen, setIsCatOpen] = useState(false);

  // "Add your own" custom skill state
  const [isAddingOwn, setIsAddingOwn] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [error, setError] = useState("");

  const catContainerRef = useRef(null);
  const catInputRef = useRef(null);
  const customInputRef = useRef(null);

  // Fetch skill categories from server and merge/dedupe
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/skills", { cache: "no-store" });
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(dedupeCategories(json.data));
        }
      } catch {
        // Fallback seed is already loaded
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (catContainerRef.current && !catContainerRef.current.contains(e.target)) {
        setIsCatOpen(false);
        if (selectedCategory) {
          setCategoryQuery(selectedCategory);
        } else {
          setCategoryQuery("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedCategory]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, categoryQuery]);

  // Selected category object
  const currentCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.name.toLowerCase() === selectedCategory.toLowerCase()) || null;
  }, [categories, selectedCategory]);

  // All skills for the current category (base subcategories + any added custom skills)
  const categorySkillsList = useMemo(() => {
    if (!selectedCategory) return [];
    const baseSubs = currentCategoryObj ? currentCategoryObj.subcategories || [] : [];
    const valueSubs = value
      .filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase())
      .map((s) => s.subcategory);
    return Array.from(new Set([...baseSubs, ...valueSubs]));
  }, [currentCategoryObj, selectedCategory, value]);

  function handleSelectCategory(catName) {
    setSelectedCategory(catName);
    setCategoryQuery(catName);
    setIsCatOpen(false);
    setError("");

    // Automatically assign all subcategories from this category to the user
    const targetObj = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    if (targetObj && Array.isArray(targetObj.subcategories) && targetObj.subcategories.length > 0) {
      const existingKeys = new Set(
        value.map((s) => `${(s.category || "").toLowerCase()}::${(s.subcategory || "").toLowerCase()}`)
      );
      const toAdd = [];
      for (const sub of targetObj.subcategories) {
        const key = `${catName.toLowerCase()}::${sub.toLowerCase()}`;
        if (!existingKeys.has(key)) {
          toAdd.push({ category: catName, subcategory: sub });
        }
      }
      if (toAdd.length > 0) {
        onChange([...value, ...toAdd]);
      }
    }
  }

  function handleToggleSkill(skillName, catName) {
    const targetSub = String(skillName || "").trim();
    if (!targetSub) return;
    const targetCat = String(catName || selectedCategory).trim() || "General";

    const isAlreadySelected = value.some(
      (s) =>
        s.subcategory.toLowerCase() === targetSub.toLowerCase() &&
        s.category.toLowerCase() === targetCat.toLowerCase()
    );

    if (isAlreadySelected) {
      // Remove from selection
      onChange(
        value.filter(
          (s) =>
            !(
              s.subcategory.toLowerCase() === targetSub.toLowerCase() &&
              s.category.toLowerCase() === targetCat.toLowerCase()
            )
        )
      );
    } else {
      // Add to selection
      onChange([...value, { category: targetCat, subcategory: targetSub }]);
    }
    setError("");
  }

  async function syncCustomSkill(catName, subName) {
    try {
      await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subcategory",
          category: catName,
          subcategory: subName,
        }),
      });
    } catch {
      // background sync fail safe
    }
  }

  function handleConfirmAddOwn() {
    const skillName = customSkillInput.trim();
    if (!skillName) {
      setIsAddingOwn(false);
      return;
    }

    const targetCat = selectedCategory || "General";

    const alreadyExists = value.some(
      (s) =>
        s.subcategory.toLowerCase() === skillName.toLowerCase() &&
        s.category.toLowerCase() === targetCat.toLowerCase()
    );

    if (alreadyExists) {
      setError(`"${skillName}" is already added.`);
      return;
    }

    setError("");
    onChange([...value, { category: targetCat, subcategory: skillName }]);

    // Also add to category subcategories in local state
    setCategories((prev) =>
      prev.map((c) => {
        if (c.name.toLowerCase() === targetCat.toLowerCase()) {
          const subs = c.subcategories || [];
          if (!subs.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
            return { ...c, subcategories: [...subs, skillName] };
          }
        }
        return c;
      })
    );

    setCustomSkillInput("");
    syncCustomSkill(targetCat, skillName);
  }

  function removeSkill(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-navy-700/60 bg-navy-900/40 p-4 sm:p-6">
      {/* 1. Skill Category Selection */}
      <div ref={catContainerRef} className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="tracked-label text-xs text-cream/90">
            Skill Category / Domain
          </label>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("");
                setCategoryQuery("");
                requestAnimationFrame(() => catInputRef.current?.focus());
              }}
              className="text-xs text-muted transition hover:text-gold-400"
            >
              Change category
            </button>
          )}
        </div>

        <div className="relative">
          <MdSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            ref={catInputRef}
            type="text"
            value={categoryQuery}
            onChange={(e) => {
              setCategoryQuery(e.target.value);
              setIsCatOpen(true);
              setError("");
            }}
            onFocus={() => setIsCatOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (filteredCategories.length > 0) {
                  handleSelectCategory(filteredCategories[0].name);
                }
              } else if (e.key === "Escape") {
                setIsCatOpen(false);
              }
            }}
            placeholder={
              loading
                ? "Loading categories…"
                : "Search or select category (e.g. Real Estate, IT, Digital Marketing)..."
            }
            className={`${inputClass} pl-12 pr-10 text-sm`}
          />
          {categoryQuery ? (
            <button
              type="button"
              onClick={() => {
                setCategoryQuery("");
                setSelectedCategory("");
                setIsCatOpen(true);
              }}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:text-cream"
              aria-label="Clear category"
            >
              <MdClose className="h-4 w-4" />
            </button>
          ) : (
            <MdKeyboardArrowDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          )}
        </div>

        {/* Category Dropdown */}
        {isCatOpen && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-navy-700/80 bg-navy-900 p-2 shadow-2xl">
            {filteredCategories.length === 0 ? (
              <p className="px-4 py-3 text-center text-xs text-muted">
                No matching categories found
              </p>
            ) : (
              filteredCategories.map((c) => {
                const isSelected = selectedCategory.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c._id || c.name}
                    type="button"
                    onClick={() => handleSelectCategory(c.name)}
                    className={`flex min-h-[46px] w-full items-center justify-between rounded-full px-3.5 text-left text-sm transition ${
                      isSelected
                        ? "bg-gold-400/15 font-medium text-gold-400"
                        : "text-cream hover:bg-navy-800"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="flex items-center gap-2 text-xs text-muted">
                      {c.subcategories?.length > 0 && (
                        <span>{c.subcategories.length} skills</span>
                      )}
                      {isSelected && <MdCheck className="h-4 w-4 text-gold-400" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 2. Skills Section for Selected Category */}
      {selectedCategory && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="tracked-label text-xs text-cream/90">
              Skills for {selectedCategory}
            </label>
            <span className="text-[11px] text-muted">
              Click <span className="text-red-400 font-bold">✕</span> to remove &bull; Click <span className="text-gold-400 font-bold">+</span> to add
            </span>
          </div>

          {/* Clickable Skill Pills */}
          {categorySkillsList.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {categorySkillsList.map((skill) => {
                const isSelected = value.some(
                  (s) =>
                    s.category?.toLowerCase() === selectedCategory.toLowerCase() &&
                    s.subcategory?.toLowerCase() === skill.toLowerCase()
                );

                return isSelected ? (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/80 bg-gold-400/10 px-3 py-1.5 text-xs font-medium text-cream shadow-xs transition"
                  >
                    <MdCheck className="h-3.5 w-3.5 text-gold-400 shrink-0" />
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleSkill(skill, selectedCategory)}
                      className="ml-1 rounded-full p-0.5 text-muted transition hover:text-red-400"
                      title={`Remove "${skill}"`}
                      aria-label={`Remove ${skill}`}
                    >
                      <MdClose className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ) : (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill, selectedCategory)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-navy-700 bg-navy-950/80 px-3 py-1.5 text-xs text-muted transition hover:border-gold-400/60 hover:text-cream active:scale-[0.98]"
                    title={`Add "${skill}"`}
                  >
                    <MdAdd className="h-3.5 w-3.5 text-gold-400/70" />
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted">No predefined skills found for this category.</p>
          )}

          {/* Add Your Own Skill */}
          <div className="pt-1">
            {isAddingOwn ? (
              <div className="flex items-center gap-2">
                <input
                  ref={customInputRef}
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => {
                    setCustomSkillInput(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleConfirmAddOwn();
                    } else if (e.key === "Escape") {
                      setIsAddingOwn(false);
                      setCustomSkillInput("");
                    }
                  }}
                  placeholder={`Type custom skill for ${selectedCategory}...`}
                  className={`${inputClass} text-sm`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleConfirmAddOwn}
                  className="tracked-label flex h-14 shrink-0 items-center justify-center gap-1.5 rounded-full bg-gold-400 px-5 text-xs font-semibold text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 hover:shadow-gold-400/20 active:scale-[0.98]"
                >
                  <MdAdd className="h-4 w-4" /> Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingOwn(false);
                    setCustomSkillInput("");
                  }}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-navy-700/60 text-muted transition hover:text-cream active:scale-[0.98]"
                  aria-label="Cancel"
                >
                  <MdClose className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsAddingOwn(true);
                  requestAnimationFrame(() => customInputRef.current?.focus());
                }}
                className="tracked-label flex w-fit items-center gap-1.5 rounded-full border border-dashed border-gold-500/60 bg-gold-500/5 px-4 py-2.5 text-xs text-gold-400 transition hover:border-gold-400 hover:bg-gold-500/15 active:scale-[0.98]"
              >
                <MdAdd className="h-4 w-4" /> Add your own skill
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* 3. Added Skills List */}
      {value.length > 0 && (
        <div className="border-t border-navy-800/80 pt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="tracked-label text-xs text-cream/80">
              Your Added Skills ({value.length})
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {value.map((skill, i) => (
              <span
                key={`${skill.category}-${skill.subcategory}-${i}`}
                className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-navy-950 px-3.5 py-2 text-xs text-cream shadow-sm"
              >
                <span className="font-medium text-cream">{skill.subcategory}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(i)}
                  aria-label={`Remove ${skill.subcategory}`}
                  className="ml-1 rounded-full text-muted transition hover:text-red-400"
                >
                  <MdClose className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
