
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Column = {
  name: string;
  kind: "number" | "textarea" | "text";
  required: boolean;
  nullable: boolean;
};

export default function ProductForm({ columns }: { columns: Column[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not create product.");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {columns.map((column) => (
          <div
            key={column.name}
            className={column.kind === "textarea" ? "md:col-span-2" : ""}
          >
            <label
              htmlFor={column.name}
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {column.name.replaceAll("_", " ")}
              {column.required ? " *" : ""}
            </label>

            {column.kind === "textarea" ? (
              <textarea
                id={column.name}
                name={column.name}
                required={column.required}
                rows={4}
                value={values[column.name] ?? ""}
                onChange={(event) =>
                  setValues({ ...values, [column.name]: event.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            ) : (
              <input
                id={column.name}
                name={column.name}
                type={column.kind === "number" ? "number" : "text"}
                min={column.kind === "number" ? 0 : undefined}
                step={column.kind === "number" ? "any" : undefined}
                required={column.required}
                value={values[column.name] ?? ""}
                onChange={(event) =>
                  setValues({ ...values, [column.name]: event.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg border px-5 py-3"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
