// app/admin/products/ProductTable.tsx
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
  imageUrl: string | null;
  stock: number | null;
};

// Small picture, or a gray box when the product has no picture.
function Thumb({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return <div className="h-10 w-10 shrink-0 rounded-md bg-gray-200" aria-hidden="true" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-10 w-10 shrink-0 rounded-md border border-gray-200 object-cover"
    />
  );
}

// Stock number, in red when the product is sold out.
function StockText({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="font-medium text-red-600">Out of stock</span>;
  return <span>{stock}</span>;
}

export default function ProductTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();

  // The IDs of the rows the admin has ticked.
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));

  // Show the Stock column only when the products table really has stock values.
  const hasStock = products.some((p) => p.stock !== null);

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
      {/* ── Bulk action bar (same on desktop and mobile) ── */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Select-all box: mobile only, because the desktop table has one in its header */}
          <input
            type="checkbox"
            aria-label="Select all products on this page"
            checked={allSelected}
            onChange={toggleAll}
            className="h-4 w-4 cursor-pointer md:hidden"
          />
          <p className="text-sm text-gray-600">
            {selected.size > 0
              ? `${selected.size} selected`
              : "Select products to delete several at once"}
          </p>
        </div>

        <button
          type="button"
          onClick={deleteSelected}
          disabled={selected.size === 0 || busy}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Deleting..." : `Delete selected (${selected.size})`}
        </button>
      </div>

      {/* ── DESKTOP / TABLET: standard table (md and wider) ── */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-600">
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
              <th className="px-4 py-3 text-right">Price</th>
              {hasStock && <th className="px-4 py-3 text-right">Stock</th>}
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
                <td className="px-4 py-3 text-gray-500">{product.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Thumb src={product.imageUrl} alt={product.name} />
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{product.categoryLabel}</td>
                <td className="px-4 py-3 text-right font-medium">{product.priceText}</td>
                {hasStock && (
                  <td className="px-4 py-3 text-right text-gray-700">
                    {product.stock === null ? "—" : <StockText stock={product.stock} />}
                  </td>
                )}
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

      {/* ── MOBILE: one card per product (below md) ── */}
      <ul className="space-y-3 md:hidden">
        {products.map((product) => (
          <li
            key={product.id}
            className={`rounded-lg border p-4 ${
              selected.has(product.id)
                ? "border-red-200 bg-red-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                aria-label={`Select ${product.name}`}
                checked={selected.has(product.id)}
                onChange={() => toggleOne(product.id)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer"
              />

              <Thumb src={product.imageUrl} alt={product.name} />

              <div className="min-w-0 flex-1">
                <p className="break-words font-semibold text-gray-900">{product.name}</p>
                <p className="mt-1 text-sm text-gray-500">{product.categoryLabel}</p>
                <p className="mt-2 text-base font-bold text-gray-900">{product.priceText}</p>
                <p className="mt-1 text-xs text-gray-400">
                  ID: {product.id}
                  {hasStock && product.stock !== null && (
                    <>
                      {" · Stock: "}
                      <StockText stock={product.stock} />
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-4 border-t border-gray-100 pt-3 text-sm">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="text-blue-600 hover:underline"
              >
                Edit
              </Link>
              <DeleteProductButton id={product.id} name={product.name} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}