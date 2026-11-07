import { pool } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategory: string | null;
  image: string | null;
};

export const HOME_PRODUCT_COUNT = 24;

// Sort options. The URL key is mapped to a fixed SQL string, so user input never goes into ORDER BY.
export const PRODUCT_SORTS = {
  newest: "id DESC",
  oldest: "id ASC",
  "price-asc": "price ASC",
  "price-desc": "price DESC",
} as const;

export type ProductSort = keyof typeof PRODUCT_SORTS;

export type ProductQuery = {
  category?: string;
  subcategory?: string;
  q?: string;
  sort?: ProductSort;
  limit?: number;
};

// Turns any value from the URL into a valid sort key, falling back to "newest".
// hasOwnProperty is used so names like "constructor" from the prototype are rejected.
export function parseSort(value: unknown): ProductSort {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(PRODUCT_SORTS, value)
    ? (value as ProductSort)
    : "newest";
}

// Converts a database row into a Product with the correct types.
// MySQL DECIMAL values can come back as strings, so price is converted to a number.
function toProduct(row: RowDataPacket): Product {
  return {
    id: Number(row.id),
    name: String(row.name),
    price: Number(row.price),
    category: String(row.category ?? ""),
    subcategory: row.subcategory ? String(row.subcategory) : null,
    image: row.image ? String(row.image) : null,
  };
}

// Returns products, optionally filtered by category, subcategory, and search text, sorted, and limited.
export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const conditions: string[] = [];
  const params: string[] = [];

  if (query.category) {
    conditions.push("category = ?");
    params.push(query.category);
  }
  if (query.subcategory) {
    conditions.push("subcategory = ?");
    params.push(query.subcategory);
  }
  if (query.q && query.q.trim()) {
    // Escape the LIKE wildcards so a search for "100%" matches the text literally.
    const term = query.q.trim().replace(/[\\%_]/g, "\\$&");
    conditions.push("name LIKE ?");
    params.push(`%${term}%`);
  }

  const parts: string[] = ["SELECT id, name, price, category, subcategory, image FROM products"];
  if (conditions.length > 0) {
    parts.push(`WHERE ${conditions.join(" AND ")}`);
  }
  parts.push(`ORDER BY ${PRODUCT_SORTS[query.sort ?? "newest"]}`);

  // The limit is forced to a whole number from 1 to 100 before it goes into the SQL.
  if (query.limit) {
    parts.push(`LIMIT ${Math.max(1, Math.min(Math.floor(query.limit), 100))}`);
  }

  const [rows] = await pool.query<RowDataPacket[]>(parts.join(" "), params);
  return rows.map(toProduct);
}

// Used by the home page: the newest products, up to the given count.
export function getHomeProducts(limit: number = HOME_PRODUCT_COUNT): Promise<Product[]> {
  return getProducts({ limit });
}
