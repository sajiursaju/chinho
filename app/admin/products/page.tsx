// app/admin/products/page.tsx
import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import {
  requireAdmin,
  countProducts,
  listProductsPage,
  listProductCategories,
} from "@/lib/adminProducts";
import { getMainCategory, getSubCategory } from "@/config/categories";
import ProductTable, { type ProductRow } from "./ProductTable";

const PAGE_SIZE = 20;

// Admin pages depend on the logged-in user, so they must not be cached.
export const dynamic = "force-dynamic";

type SearchParams = { page?: string; q?: string; category?: string };

// Turns the stored slugs into readable text, such as "Men · Shirts".
function categoryText(category: string | null, subcategory: string | null): string {
  const main = getMainCategory(category);
  const sub = getSubCategory(category, subcategory);
  if (!main) return "Uncategorized";
  return sub ? `${main.label} · ${sub.label}` : main.label;
}

// Builds a link that keeps the current search and category.
function buildHref(q: string, category: string, page: number): string {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (category) sp.set("category", category);
  if (page > 1) sp.set("page", String(page));
  const query = sp.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
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

  // Search text from the URL (trimmed and limited in length).
  const q = (params.q ?? "").trim().slice(0, 100);

  // Only accept a category that really exists in the products table.
  const categories = await listProductCategories();
  const category = categories.includes(params.category ?? "") ? params.category! : "";

  const filters = { search: q, category };
  const total = await countProducts(filters);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Use the page from the URL, but never less than 1 or more than the last page.
  const requested = Math.floor(Number(params.page));
  const current =
    Number.isInteger(requested) && requested >= 1 ? Math.min(requested, pages) : 1;

  const rows = await listProductsPage(current, PAGE_SIZE, filters);

  // Prepare plain values for the table component.
  const products: ProductRow[] = rows.map((p) => ({
    id: Number(p.id),
    name: String(p.name),
    categoryLabel: categoryText(p.category, p.subcategory),
    priceText: formatPrice(Number(p.price)),
    // Only a text path/URL is used as the picture; anything else shows a placeholder.
    imageUrl: typeof p.image === "string" && p.image ? p.image : null,
    // null when the products table has no stock column.
    stock: p.stock == null ? null : Number(p.stock),
  }));

  const isFiltered = q !== "" || category !== "";

  return (
    <main className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">
            {total} {isFiltered ? "found" : "total"}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Product
        </Link>
      </div>

      {/* Search box: a plain GET form, so it works without client JavaScript */}
      <form action="/admin/products" className="mb-4 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search products by name"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-600"
        />
        {/* Keep the chosen category when searching */}
        {category && <input type="hidden" name="category" value={category} />}
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
        >
          Search
        </button>
        {q && (
          <Link
            href={buildHref("", category, 1)}
            className="flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Link
            href={buildHref(q, "", 1)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              category === ""
                ? "border-blue-600 bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All
          </Link>
          {categories.map((slug) => (
            <Link
              key={slug}
              href={buildHref(q, slug, 1)}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                category === slug
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {getMainCategory(slug)?.label ?? slug}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            {isFiltered ? "No products match your search." : "No products found."}
          </p>
        </div>
      ) : (
        // The key resets the selection when the page, search or category changes.
        <ProductTable key={`${current}-${q}-${category}`} products={products} />
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {current} of {pages}
          </p>

          <div className="flex gap-2">
            {current > 1 && (
              <Link
                href={buildHref(q, category, current - 1)}
                className="rounded border bg-white px-4 py-2 hover:bg-gray-100"
              >
                Previous
              </Link>
            )}
            {current < pages && (
              <Link
                href={buildHref(q, category, current + 1)}
                className="rounded border bg-white px-4 py-2 hover:bg-gray-100"
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