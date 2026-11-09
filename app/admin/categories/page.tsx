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

export default async function CategoriesPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <main className="p-6">
        <p className="text-gray-700">Admin access required.</p>
      </main>
    );
  }

  const [rows]: any = await pool.query(
    `
      SELECT category, subcategory, COUNT(*) AS product_count
      FROM products
      WHERE category IS NOT NULL AND TRIM(category) <> ''
      GROUP BY category, subcategory
      ORDER BY category, subcategory
    `
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Product categories and subcategories currently used in the store.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add product
        </Link>
      </div>

      {rows.length === 0 ? (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-8 text-center">
            <h3 className="font-semibold text-gray-900">No categories found</h3>
            <p className="mt-2 text-sm text-gray-600">
              Add products with a category and subcategory to see them here.
            </p>
          </div>
        </section>
      ) : (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Category overview</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {rows.map((row: any, index: number) => (
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
                    {Number(row.product_count)} products
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
        </section>
      )}
    </main>
  );
}
