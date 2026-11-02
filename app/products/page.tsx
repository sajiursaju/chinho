import Link from "next/link";
import { pool } from "@/lib/db";
import { productCategories } from "@/config/site";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const SORTS: Record<string, { label: string; sql: string }> = {
  newest: { label: "Newest", sql: "id DESC" },
  price_asc: { label: "Price: low to high", sql: "price ASC" },
  price_desc: { label: "Price: high to low", sql: "price DESC" },
  name: { label: "Name A-Z", sql: "name ASC" },
};

// Whitelist: finds a parent OR a sub-category.
// A parent also includes the slugs of its sub-categories.
function findCategory(value: string) {
  for (const c of productCategories) {
    if (c.value === value) {
      return {
        value: c.value,
        label: c.label,
        slugs: [c.value, ...(c.children?.map((s) => s.value) ?? [])],
      };
    }
    const child = c.children?.find((s) => s.value === value);
    if (child) {
      return { value: child.value, label: child.label, slugs: [child.value] };
    }
  }
  return null;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>;
}) {
  const { q = "", sort = "newest", category = "" } = await searchParams;
  const search = q.trim().slice(0, 100);
  const order = (SORTS[sort] ?? SORTS.newest).sql; // whitelisted
  const active = findCategory(category); // whitelisted

  const where: string[] = [];
  const params: string[] = [];
  if (search) {
    where.push("name LIKE ?");
    params.push(`%${search}%`);
  }
  if (active) {
    where.push(`category IN (${active.slugs.map(() => "?").join(",")})`);
    params.push(...active.slugs);
  }
  const sql = `SELECT * FROM products ${
    where.length ? "WHERE " + where.join(" AND ") : ""
  } ORDER BY ${order}`;

  const [rows]: any = await pool.query(sql, params);
  const products = rows as Record<string, any>[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{active ? active.label : "All products"}</h1>

      <form method="GET" className="mb-8 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search products..."
          className="min-w-[200px] flex-1 rounded border px-3 py-2"
        />
        <select name="category" defaultValue={active?.value ?? ""} className="rounded border px-3 py-2">
          <option value="">All categories</option>
          {productCategories.map((c) => (
            <optgroup key={c.value} label={c.label}>
              <option value={c.value}>All {c.label}</option>
              {c.children?.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <select name="sort" defaultValue={sort} className="rounded border px-3 py-2">
          {Object.entries(SORTS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
        <button className="rounded bg-black px-4 py-2 text-white">Apply</button>
        {(search || active || sort !== "newest") && (
          <Link href="/products" className="px-2 py-2 underline">
            Clear
          </Link>
        )}
      </form>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  price: Number(p.price),
                  image: p.image ?? p.image_url ?? p.img ?? null,
                }}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}