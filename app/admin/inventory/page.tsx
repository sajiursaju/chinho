import Link from "next/link";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/adminProducts";
import { getMainCategory, getSubCategory } from "@/config/categories";

export const dynamic = "force-dynamic";

function categoryText(category: string | null, subcategory: string | null): string {
  const main = getMainCategory(category);
  const sub = getSubCategory(category, subcategory);
  if (!main) return "Uncategorized";
  return sub ? `${main.label} · ${sub.label}` : main.label;
}

export default async function InventoryPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <main className="p-6">
        <p className="text-gray-700">Admin access required.</p>
      </main>
    );
  }

  const [summary]: any = await pool.query(`
    SELECT
      COUNT(*) AS total_products,
      SUM(CASE WHEN category = 'men' THEN 1 ELSE 0 END) AS men_products,
      SUM(CASE WHEN category = 'women' THEN 1 ELSE 0 END) AS women_products,
      SUM(CASE WHEN image IS NULL OR TRIM(image) = '' THEN 1 ELSE 0 END) AS missing_images
    FROM products
  `);

  const stats = summary[0] || {
    total_products: 0,
    men_products: 0,
    women_products: 0,
    missing_images: 0,
  };

  const [byCategory]: any = await pool.query(`
    SELECT category, subcategory, COUNT(*) AS product_count
    FROM products
    WHERE category IS NOT NULL AND TRIM(category) <> ''
    GROUP BY category, subcategory
    ORDER BY category, subcategory
  `);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-1 text-sm text-gray-600">
            Product inventory overview for the store.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add product
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total products</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {Number(stats.total_products)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Men</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {Number(stats.men_products)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Women</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {Number(stats.women_products)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Missing images</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {Number(stats.missing_images)}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Stock by category</h2>
        </div>

        {byCategory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No product categories available yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {byCategory.map((row: any, index: number) => (
              <div
                key={`${row.category}-${row.subcategory ?? index}`}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {categoryText(row.category, row.subcategory)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {row.category} / {row.subcategory || "general"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {Number(row.product_count)} items
                  </span>
                  <Link
                    href="/admin/products"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
