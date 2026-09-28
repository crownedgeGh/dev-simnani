"use client";

import { useEffect, useMemo, useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";
import { inputClass, selectClass } from "./inputStyles";

const ADD_NEW_VALUE = "__add_new__";

// Skills field for the freelancer registration wizard: pick a skill
// category, pick a subcategory under it, then add the pair to the running
// list. Both dropdowns offer "Add your own" which persists the new
// category/subcategory to the shared SkillCategory collection via
// /api/skills so it becomes available to every future freelancer.
export default function SkillsSelector({ value = [], onChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState(null); // string while adding, null otherwise
  const [newSubcategoryInput, setNewSubcategoryInput] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/skills", { cache: "no-store" });
        const json = await res.json();
        if (active && json.success) {
          setCategories(json.data);
        }
      } catch {
        if (active) setError("Could not load skill categories.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const subcategoryOptions = useMemo(() => {
    const cat = categories.find((c) => c.name === selectedCategory);
    return cat?.subcategories || [];
  }, [categories, selectedCategory]);

  function handleCategoryChange(val) {
    setError("");
    if (val === ADD_NEW_VALUE) {
      setNewCategoryInput("");
      return;
    }
    setSelectedCategory(val);
    setSelectedSubcategory("");
  }

  async function confirmNewCategory() {
    const name = newCategoryInput.trim();
    if (!name) {
      setNewCategoryInput(null);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "category", name }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not add category");
      setCategories((prev) => {
        const exists = prev.some((c) => c.name.toLowerCase() === json.data.name.toLowerCase());
        return exists ? prev : [...prev, json.data].sort((a, b) => a.name.localeCompare(b.name));
      });
      setSelectedCategory(json.data.name);
      setSelectedSubcategory("");
      setNewCategoryInput(null);
    } catch (err) {
      setError(err.message || "Could not add category");
    } finally {
      setSaving(false);
    }
  }

  function handleSubcategoryChange(val) {
    setError("");
    if (val === ADD_NEW_VALUE) {
      setNewSubcategoryInput("");
      return;
    }
    setSelectedSubcategory(val);
  }

  async function confirmNewSubcategory() {
    const subcategory = newSubcategoryInput.trim();
    if (!subcategory) {
      setNewSubcategoryInput(null);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subcategory", category: selectedCategory, subcategory }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not add skill");
      setCategories((prev) =>
        prev.map((c) => (c.name === json.data.name ? json.data : c))
      );
      setSelectedSubcategory(subcategory);
      setNewSubcategoryInput(null);
    } catch (err) {
      setError(err.message || "Could not add skill");
    } finally {
      setSaving(false);
    }
  }

  function addSkill() {
    if (!selectedCategory || !selectedSubcategory) {
      setError("Select a skill category and skill to add it.");
      return;
    }
    const exists = value.some(
      (s) => s.category === selectedCategory && s.subcategory === selectedSubcategory
    );
    if (exists) {
      setError("This skill is already added.");
      return;
    }
    setError("");
    onChange([...value, { category: selectedCategory, subcategory: selectedSubcategory }]);
    setSelectedSubcategory("");
  }

  function removeSkill(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="tracked-label mb-2 block text-xs text-cream/80">Skill Category</label>
          {newCategoryInput !== null ? (
            <AddOwnInput
              value={newCategoryInput}
              onChange={setNewCategoryInput}
              onConfirm={confirmNewCategory}
              onCancel={() => setNewCategoryInput(null)}
              saving={saving}
              placeholder="e.g. Event Management"
            />
          ) : (
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={loading}
              className={selectClass}
            >
              <option value="">{loading ? "Loading…" : "Select a category"}</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value={ADD_NEW_VALUE}>+ Add your own…</option>
            </select>
          )}
        </div>

        <div>
          <label className="tracked-label mb-2 block text-xs text-cream/80">Skill</label>
          {newSubcategoryInput !== null ? (
            <AddOwnInput
              value={newSubcategoryInput}
              onChange={setNewSubcategoryInput}
              onConfirm={confirmNewSubcategory}
              onCancel={() => setNewSubcategoryInput(null)}
              saving={saving}
              placeholder="e.g. Wedding Planning"
            />
          ) : (
            <select
              value={selectedSubcategory}
              onChange={(e) => handleSubcategoryChange(e.target.value)}
              disabled={!selectedCategory}
              className={selectClass}
            >
              <option value="">
                {selectedCategory ? "Select a skill" : "Select a category first"}
              </option>
              {subcategoryOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              {selectedCategory && <option value={ADD_NEW_VALUE}>+ Add your own…</option>}
            </select>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={addSkill}
        className="tracked-label flex w-fit items-center gap-1.5 border border-gold-500/70 px-4 py-2.5 text-xs text-gold-400 transition hover:bg-gold-500/10"
      >
        <MdAdd className="h-4 w-4" /> Add Skill
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((skill, i) => (
            <span
              key={`${skill.category}-${skill.subcategory}-${i}`}
              className="flex items-center gap-2 border border-navy-700/60 bg-navy-900 px-3 py-2 text-xs text-cream"
            >
              <span className="text-muted">{skill.category}</span>
              <span className="text-gold-400">/</span>
              {skill.subcategory}
              <button
                type="button"
                onClick={() => removeSkill(i)}
                aria-label={`Remove ${skill.subcategory}`}
                className="text-muted transition hover:text-red-400"
              >
                <MdClose className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AddOwnInput({ value, onChange, onConfirm, onCancel, saving, placeholder }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onConfirm();
          }
          if (e.key === "Escape") onCancel();
        }}
        className={inputClass}
      />
      <button
        type="button"
        onClick={onConfirm}
        disabled={saving}
        className="tracked-label h-14 shrink-0 bg-gold-400 px-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Add"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex h-14 w-14 shrink-0 items-center justify-center border border-navy-700/60 text-muted transition hover:text-cream"
        aria-label="Cancel"
      >
        <MdClose className="h-4 w-4" />
      </button>
    </div>
  );
}
