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
};

export function normalizeSort(value: unknown): ProductSort {
  if (typeof value === "string" && value in PRODUCT_SORTS) {
    return value as ProductSort;
  }
  return "newest";
}

function buildWhere(query: ProductQuery) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (query.category) {
    clauses.push("category = ?");
    params.push(query.category);
  }
  if (query.subcategory) {
    clauses.push("subcategory = ?");
    params.push(query.subcategory);
  }
  if (query.q) {
    clauses.push("(name LIKE ? OR category LIKE ?)");
    params.push(`%${query.q}%`, `%${query.q}%`);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export async function countHomeProducts(query: ProductQuery = {}): Promise<number> {
  const { where, params } = buildWhere(query);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM products ${where}`,
    params
  );
  return Number(rows[0]?.total ?? 0);
}

export async function getHomeProductsPage(
  query: ProductQuery = {},
  page: number = 1,
  pageSize: number = HOME_PRODUCT_COUNT
) {
  const safePage = Math.max(1, page);
  const limit = Math.min(Math.max(pageSize, 1), 100);
  const offset = (safePage - 1) * limit;
  const orderBy = PRODUCT_SORTS[normalizeSort(query.sort)];
  const { where, params } = buildWhere(query);

  const [productRows, total] = await Promise.all([
    pool.query<RowDataPacket[]>(
      `SELECT id, name, price, category, subcategory, image
       FROM products
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    countHomeProducts(query),
  ]);

  const products = productRows[0] as Product[];
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    products,
    total,
    page: safePage,
    pageSize: limit,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}