import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";

// Returns the logged-in user if they are an admin, otherwise null.
export async function requireAdmin() {
  const session = await getSession();
  return session?.role === "admin" ? session : null;
}

// Total number of products, used to work out how many pages there are.
export async function countProducts(): Promise<number> {
  const [rows]: any = await pool.query("SELECT COUNT(*) AS n FROM products");
  return Number(rows[0].n);
}

// One page of products, newest first.
export async function listProductsPage(page: number, pageSize: number) {
  const safePage = Math.max(1, Math.floor(page));
  const offset = (safePage - 1) * pageSize;
  const [rows]: any = await pool.query(
    "SELECT * FROM products ORDER BY id DESC LIMIT ? OFFSET ?",
    [pageSize, offset]
  );
  return rows as Record<string, any>[];
}
