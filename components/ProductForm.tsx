"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Column } from "@/lib/adminProducts";
import { productCategories } from "@/config/site";

export default function ProductForm({
  columns,
  initial,
  productId,
}: {
  columns: Column[];
  initial: Record<string, string>;
  productId?: number;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(
      productId ? `/api/admin/products/${productId}` : "/api/admin/products",
      {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );
    const json = await res.json();
    setSaving(false);
    if (!res.ok) return setError(json.error);
    router.push("/admin/products");
    router.refresh();
  }

  const field = "w-full rounded border p-2";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {columns.map((col) => (
        <label key={col.name} className="block">
          <span className="mb-1 block text-sm font-medium">
            {col.name}
            {col.required && " *"}
          </span>
          {col.name === "category" ? (
            <select
              value={values.category ?? ""}
              onChange={(e) => setValues({ ...values, category: e.target.value })}
              className={field}
            >
              <option value="">Select a category</option>
              {productCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          ) : col.kind === "textarea" ? (
            <textarea
              rows={4}
              value={values[col.name] ?? ""}
              onChange={(e) => setValues({ ...values, [col.name]: e.target.value })}
              className={field}
            />
          ) : (
            <input
              type={col.kind === "number" ? "number" : "text"}
              step={col.kind === "number" ? "any" : undefined}
              min={col.kind === "number" ? 0 : undefined}
              value={values[col.name] ?? ""}
              onChange={(e) => setValues({ ...values, [col.name]: e.target.value })}
              className={field}
            />
          )}
        </label>
      ))}
      {error && <p className="text-red-600">{error}</p>}
      <button disabled={saving} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {saving ? "Saving..." : productId ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}