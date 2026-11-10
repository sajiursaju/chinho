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

// Sort options. The URL key maps to a fixed SQL string.
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
  offset?: number;
};

// Turns any value from the URL into a valid sort key, falling back to "newest".
export function parseSort(value: unknown): ProductSort {
  return typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(PRODUCT_SORTS, value)
    ? (value as ProductSort)
    : "newest";
}

// Converts a database row into a Product with the correct types.
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

// Returns products, optionally filtered, sorted, and paginated.
export async function getProducts(
  query: ProductQuery = {}
): Promise<Product[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.category) {
    conditions.push("category = ?");
    params.push(query.category);
  }

  if (query.subcategory) {
    conditions.push("subcategory = ?");
    params.push(query.subcategory);
  }

  if (query.q?.trim()) {
    // Escape LIKE wildcards so searches match those characters literally.
    const term = query.q.trim().replace(/[\\%_]/g, "\\$&");
    conditions.push("name LIKE ?");
    params.push(`%${term}%`);
  }

  const parts: string[] = [
    "SELECT id, name, price, category, subcategory, image FROM products",
  ];

  if (conditions.length > 0) {
    parts.push(`WHERE ${conditions.join(" AND ")}`);
  }

  parts.push(`ORDER BY ${PRODUCT_SORTS[query.sort ?? "newest"]}`);

  if (query.limit !== undefined) {
    const limit = Math.max(1, Math.min(Math.floor(query.limit) || 1, 100));
    const offset = Math.max(0, Math.floor(query.offset ?? 0));

    parts.push("LIMIT ? OFFSET ?");
    params.push(limit, offset);
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    parts.join(" "),
    params
  );

  return rows.map(toProduct);
}

export async function getProductCount(): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM products"
  );

  return Number(rows[0]?.total ?? 0);
}

// Returns a page of newest products for the home page.
export function getHomeProducts(
  limit: number = HOME_PRODUCT_COUNT,
  offset = 0
): Promise<Product[]> {
  return getProducts({ limit, offset });
}