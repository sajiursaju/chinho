import Link from "next/link";

export default function InventoryPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage stock levels for each clothing item, size, and color.
          </p>
        </div>

        <Link
          href="/admin/inventory/adjust"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Adjust stock
        </Link>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Stock overview</h2>
        </div>

        <div className="p-8 text-center">
          <h3 className="font-semibold text-gray-900">No stock data yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Add products and inventory entries to track available stock.
          </p>
        </div>
      </section>
    </main>
  );
}