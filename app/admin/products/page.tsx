import Link from "next/link";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/adminProducts";
import { productCategories } from "@/config/site";
import DeleteProductButton from "@/components/DeleteProductButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type Cat = { label: string; value: string; children?: { label: string; value: string }[] };

// Every category and subcategory in one lookup: value -> label
function buildLabels() {
  const map: Record<string, string> = {};
  for (const c of productCategories as Cat[]) {
    map[c.value] = c.label;
    for (const s of c.children ?? []) map[s.value] = s.label;
  }
  return map;
}

// A parent category also matches its subcategories
function valuesFor(category: string): string[] | null {
  for (const c of productCategories as Cat[]) {
    if (c.value === category) return [c.value, ...(c.children ?? []).map((s) => s.value)];
    for (const s of c.children ?? []) if (s.value === category) return [s.value];
  }
  return null;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  if (!(await requireAdmin())) redirect("/");

  const { q = "", category = "", page = "1" } = await searchParams;
  const search = q.trim().slice(0, 100);
  const labels = buildLabels();
  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);

  // Build the filter. Category values are checked against the config list, never raw input.
  const where: string[] = [];
  const params: (string | string[])[] = [];

  if (search) {
    where.push("name LIKE ?");
    params.push(`%${search}%`);
  }

  let activeLabel = "";
  if (category === "none") {
    where.push("(category IS NULL OR category = '')");
    activeLabel = "Uncategorized";
  } else {
    const values = valuesFor(category);
    if (values) {
      where.push("category IN (?)");
      params.push(values);
      activeLabel = labels[category];
    }
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [countRows]: any = await pool.query(
    `SELECT COUNT(*) AS n FROM products ${whereSql}`,
    params
  );
  const total = countRows[0].n as number;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(pageNumber, pages);

  const [rows]: any = await pool.query(
    `SELECT * FROM products ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, (current - 1) * PAGE_SIZE]
  );
  const products = rows as Record<string, any>[];

  // How many products are in each category (for the dropdown)
  const [groupRows]: any = await pool.query(
    "SELECT category, COUNT(*) AS n FROM products GROUP BY category"
  );
  const counts: Record<string, number> = {};
  let uncategorized = 0;
  let all = 0;
  for (const r of groupRows) {
    all += r.n;
    if (!r.category) uncategorized += r.n;
    else counts[r.category] = r.n;
  }
  const countFor = (c: Cat) =>
    (counts[c.value] ?? 0) + (c.children ?? []).reduce((sum, s) => sum + (counts[s.value] ?? 0), 0);

  // Keep the filters when moving between pages
  const pageLink = (p: number) => {
    const sp = new URLSearchParams();
    if (search) sp.set("q", search);
    if (category) sp.set("category", category);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  const filtered = Boolean(search || activeLabel);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage products</h1>
        <Link href="/admin/products/new" className="rounded bg-black px-4 py-2 text-white">
          Add product
        </Link>
      </div>

      <form
        method="GET"
        style={{ colorScheme: "light" }}
        className="mb-6 flex flex-wrap gap-3"
      >
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by product name..."
          className="min-w-[200px] flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400"
        />
        <select
          name="category"
          defaultValue={activeLabel ? category : ""}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-gray-900"
        >
          <option value="">All categories ({all})</option>
          {(productCategories as Cat[]).map((c) => (
            <option key={c.value} value={c.value}>
              {c.label} ({countFor(c)})
            </option>
          ))}
          <option value="none">Uncategorized ({uncategorized})</option>
        </select>
        <button className="rounded bg-black px-4 py-2 text-white">Filter</button>
        {filtered && (
          <Link href="/admin/products" className="px-2 py-2 underline">
            Clear
          </Link>
        )}
      </form>

      <p className="mb-3 text-sm text-gray-500">
        {total} product{total === 1 ? "" : "s"}
        {activeLabel && <> in <strong>{activeLabel}</strong></>}
        {search && <> matching &quot;{search}&quot;</>}
      </p>

      {products.length === 0 ? (
        <p className="rounded border p-6 text-center">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-left text-sm">
            <thead className="bg-gray-100 text-black">
              <tr>
                <th className="p-2">Image</th>
                <th className="p-2">ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Price</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const image = typeof p.image === "string" && p.image.startsWith("/") ? p.image : null;
                return (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200" />
                      )}
                    </td>
                    <td className="p-2">{p.id}</td>
                    <td className="max-w-xs truncate p-2">{p.name}</td>
                    <td className="p-2">
                      {p.category ? (
                        labels[p.category] ?? p.category
                      ) : (
                        <span className="text-gray-400">Uncategorized</span>
                      )}
                    </td>
                    <td className="p-2">${Number(p.price).toFixed(2)}</td>
                    <td className="p-2">
                      <div className="flex gap-3">
                        <Link href={`/admin/products/${p.id}/edit`} className="underline">
                          Edit
                        </Link>
                        <DeleteProductButton id={p.id} name={String(p.name ?? `#${p.id}`)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          {current > 1 ? (
            <Link href={pageLink(current - 1)} className="rounded border px-4 py-2">
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-gray-500">
            Page {current} of {pages}
          </span>
          {current < pages ? (
            <Link href={pageLink(current + 1)} className="rounded border px-4 py-2">
              Next
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </main>
  );
}