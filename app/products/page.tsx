import Link from "next/link";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import { getMainCategory, getSubCategory } from "@/config/categories";
import {
  getProducts,
  parseSort,
  PRODUCT_SORTS,
  type ProductSort,
} from "@/lib/products";

type SearchParams = {
  category?: string;
  subcategory?: string;
  sort?: string;
  q?: string;
};

const SORT_LABELS: Record<ProductSort, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
};

// Rebuild this page at most once every 60 seconds, so it loads fast
// and admin changes show up within a minute.
export const revalidate = 60;

// Builds a link that keeps the current filters and changes one of them.
function buildHref(params: {
  category?: string;
  subcategory?: string;
  q?: string;
  sort?: ProductSort;
}): string {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.subcategory) query.set("subcategory", params.subcategory);
  if (params.q) query.set("q", params.q);
  if (params.sort && params.sort !== "newest") query.set("sort", params.sort);
  const qs = query.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Only values in config/categories.ts are accepted. Anything else is ignored.
  const main = getMainCategory(params.category);
  const sub = getSubCategory(main?.slug, params.subcategory);
  const category = main?.slug;
  const subcategory = sub?.slug;
  const sort = parseSort(params.sort);
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";

  const products = await getProducts({ category, subcategory, sort, q });

  const title = q
    ? `Search: "${q}"`
    : main && sub
      ? `${main.label} · ${sub.label}`
      : main
        ? main.label
        : "All Products";

  return (
    <main className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
      <CategorySidebar activeCategory={category} activeSubcategory={subcategory} />

      <section className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <span className="text-sm text-gray-500">{products.length} items</span>
          </div>

          {/* Sort options */}
          <div className="flex flex-wrap gap-2 text-sm">
            {(Object.keys(PRODUCT_SORTS) as ProductSort[]).map((key) => {
              const active = sort === key;
              return (
                <Link
                  key={key}
                  href={buildHref({ category, subcategory, q, sort: key })}
                  className={`rounded-full border px-3 py-1 ${
                    active
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {SORT_LABELS[key]}
                </Link>
              );
            })}
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
