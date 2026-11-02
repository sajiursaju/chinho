"use client";

import { useState } from "react";

type Column = {
  name: string;
  kind: "number" | "textarea" | "text";
  required: boolean;
  nullable: boolean;
};

export default function ProductForm({
  columns,
}: {
  columns: Column[];
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Could not create product.");
        return;
      }

      window.location.href = "/admin/products";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {columns.map((column) => (
        <div key={column.name}>
          <label
            htmlFor={column.name}
            className="mb-2 block font-medium text-gray-700"
          >
            {column.name}
            {column.required && !column.nullable ? " *" : ""}
          </label>

          {column.kind === "textarea" ? (
            <textarea
              id={column.name}
              name={column.name}
              required={column.required && !column.nullable}
              className="w-full rounded-lg border border-gray-300 p-3"
              rows={4}
            />
          ) : (
            <input
              id={column.name}
              name={column.name}
              type={column.kind === "number" ? "number" : "text"}
              required={column.required && !column.nullable}
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          )}
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Add Product"}
      </button>
    </form>
  );
}