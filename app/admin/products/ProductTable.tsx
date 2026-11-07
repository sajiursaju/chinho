"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteProductButton from "./DeleteProductButton";

// The data this table needs. The server page prepares these values,
// so this component doesn't read the config files itself.
export type ProductRow = {
  id: number;
  name: string;
  categoryLabel: string;
  priceText: string;
};

export default function ProductTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();

  // The IDs of the rows the admin has ticked.
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));

  // Ticks or unticks one row.
  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Ticks every row on this page, or clears them all if they are already ticked.
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  async function deleteSelected() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    // Browser popup with OK and Cancel. Cancel stops here.
    const confirmed = window.confirm(
      `Delete ${ids.length} selected product(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const res = await fetch("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        window.alert(data.error ?? "The selected products could not be deleted.");
        return;
      }

      // Tell the admin about products that were kept because they are in orders.
      if (data.skipped?.length > 0) {
        window.alert(
          `${data.deleted} deleted. ${data.skipped.length} product(s) were not deleted because they are in customer orders.`
        );
      }

      setSelected(new Set());
      router.refresh();
    } catch {
      window.alert("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* Bulk action bar */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {selected.size > 0
            ? `${selected.size} selected`
            : "Select products to delete several at once"}
        </p>
        <button
          type="button"
          onClick={deleteSelected}
          disabled={selected.size === 0 || busy}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Deleting..." : `Delete selected (${selected.size})`}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all products on this page"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr
                key={product.id}
                className={selected.has(product.id) ? "bg-red-50" : "hover:bg-gray-50"}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${product.name}`}
                    checked={selected.has(product.id)}
                    onChange={() => toggleOne(product.id)}
                    className="h-4 w-4 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3">{product.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                <td className="px-4 py-3">{product.categoryLabel}</td>
                <td className="px-4 py-3 font-medium">{product.priceText}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
