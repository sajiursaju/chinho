import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import {
  requireAdmin,
  countProducts,
  listProductsPage,
} from "@/lib/adminProducts";
import { getMainCategory, getSubCategory } from "@/config/categories";
import ProductTable, { type ProductRow } from "./ProductTable";

const PAGE_SIZE = 20;

// Admin pages depend on the logged-in user, so they must not be cached.
export const dynamic = "force-dynamic";

type SearchParams = { page?: string };

// Turns the stored slugs into readable text, such as "Men · Shirts".
function categoryText(category: string | null, subcategory: string | null): string {
  const main = getMainCategory(category);
  const sub = getSubCategory(category, subcategory);
  if (!main) return "Uncategorized";
  return sub ? `${main.label} · ${sub.label}` : main.label;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await requireAdmin();
  if (!admin) {
    return (
      <main className="p-6">
        <p className="text-gray-700">Admin access required.</p>
      </main>
    );
  }

  const params = await searchParams;
  const total = await countProducts();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Use the page from the URL, but never less than 1 or more than the last page.
  const requested = Math.floor(Number(params.page));
  const current =
    Number.isInteger(requested) && requested >= 1 ? Math.min(requested, pages) : 1;

  const rows = await listProductsPage(current, PAGE_SIZE);

  // Prepare plain values for the table component.
  const products: ProductRow[] = rows.map((p) => ({
    id: Number(p.id),
    name: String(p.name),
    categoryLabel: categoryText(p.category, p.subcategory),
    priceText: formatPrice(Number(p.price)),
  }));

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        // The key resets the selection when the admin moves to another page.
        <ProductTable key={current} products={products} />
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {current} of {pages}
          </p>

          <div className="flex gap-2">
            {current > 1 && (
              <Link
                href={`/admin/products?page=${current - 1}`}
                className="rounded border px-4 py-2 hover:bg-gray-100"
              >
                Previous
              </Link>
            )}
            {current < pages && (
              <Link
                href={`/admin/products?page=${current + 1}`}
                className="rounded border px-4 py-2 hover:bg-gray-100"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </main>
  );
}