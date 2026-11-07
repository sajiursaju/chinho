"use client";

import { MAIN_CATEGORIES } from "@/config/categories";

type Value = { category: string; subcategory: string };

type Props = {
  value: Value;
  onChange: (next: Value) => void;
};

const selectClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:bg-gray-100";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

// Two linked dropdowns for the admin add/edit form.
// Choosing a category shows only that category's subcategories.
// The options come from config/categories.ts, the same list the shop uses.
export default function CategorySelect({ value, onChange }: Props) {
  const current = MAIN_CATEGORIES.find((c) => c.slug === value.category);

  return (
    <>
      <div>
        <label htmlFor="category" className={labelClass}>
          Category
        </label>
        <select
          id="category"
          value={value.category}
          onChange={(e) => onChange({ category: e.target.value, subcategory: "" })}
          required
          className={selectClass}
        >
          <option value="" disabled>
            Select a category
          </option>
          {MAIN_CATEGORIES.map((main) => (
            <option key={main.slug} value={main.slug}>
              {main.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="subcategory" className={labelClass}>
          Subcategory
        </label>
        <select
          id="subcategory"
          value={value.subcategory}
          onChange={(e) => onChange({ category: value.category, subcategory: e.target.value })}
          required
          disabled={!current}
          className={selectClass}
        >
          <option value="" disabled>
            {current ? "Select a subcategory" : "Choose a category first"}
          </option>
          {current?.children.map((sub) => (
            <option key={sub.slug} value={sub.slug}>
              {sub.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
