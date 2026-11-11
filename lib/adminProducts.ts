// lib/adminProducts.ts
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";

// Returns the logged-in user if they are an admin, otherwise null.
export async function requireAdmin() {
  const session = await getSession();
  return session?.role === "admin" ? session : null;
}

export type ProductFilters = {
  search?: string;
  category?: string;
};

// Builds the WHERE part once, so the count and the list always match.
function buildWhere(filters: ProductFilters) {
  const clauses: string[] = [];
  const values: string[] = [];

  const search = filters.search?.trim();
  if (search) {
    // Escape LIKE wildcards so a typed % or _ is searched as plain text.
    const escaped = search.replace(/[\\%_]/g, "\\$&");
    clauses.push("name LIKE ?");
    values.push(`%${escaped}%`);
  }

  if (filters.category) {
    clauses.push("category = ?");
    values.push(filters.category);
  }

  return {
    where: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
}

// Number of products that match the filters, used to work out how many pages there are.
export async function countProducts(filters: ProductFilters = {}): Promise<number> {
  const { where, values } = buildWhere(filters);
  const [rows]: any = await pool.query(
    `SELECT COUNT(*) AS n FROM products ${where}`,
    values
  );
  return Number(rows[0].n);
}

// One page of matching products, newest first.
export async function listProductsPage(
  page: number,
  pageSize: number,
  filters: ProductFilters = {}
) {
  const safePage = Math.max(1, Math.floor(page));
  const offset = (safePage - 1) * pageSize;
  const { where, values } = buildWhere(filters);

  const [rows]: any = await pool.query(
    `SELECT * FROM products ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...values, pageSize, offset]
  );
  return rows as Record<string, any>[];
}

// The category slugs that exist in the products table (for the filter tabs).
export async function listProductCategories(): Promise<string[]> {
  const [rows]: any = await pool.query(
    "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category <> '' ORDER BY category"
  );
  return rows.map((r: any) => String(r.category));
}