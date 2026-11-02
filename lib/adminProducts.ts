import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";
import { productCategories } from "@/config/site";
export type Column = {
  name: string;
  kind: "number" | "textarea" | "text";
  required: boolean; // NOT NULL with no default
  nullable: boolean;
};

const SKIP = new Set(["id", "created_at", "updated_at", "createdAt", "updatedAt"]);

export async function requireAdmin() {
  const session = await getSession();
  return session?.role === "admin" ? session : null;
}

// Column names come from the database schema, never from the browser.
export async function getEditableColumns(): Promise<Column[]> {
  const [rows]: any = await pool.query("SHOW COLUMNS FROM products");
  return rows
    .filter((c: any) => !SKIP.has(c.Field) && !/auto_increment|generated/i.test(c.Extra))
    .map((c: any): Column => {
      const type = String(c.Type).toLowerCase();
      const kind = /int|decimal|float|double|numeric/.test(type)
        ? "number"
        : /text/.test(type)
        ? "textarea"
        : "text";
      return {
        name: c.Field,
        kind,
        required: c.Null === "NO" && c.Default === null,
        nullable: c.Null === "YES",
      };
    });
}

export function parseInput(columns: Column[], body: any) {
  const values: Record<string, string | number | null> = {};
  for (const col of columns) {
    const raw = body?.[col.name];
    const text = raw === undefined || raw === null ? "" : String(raw).trim();

    if (text === "") {
      if (col.required) return { error: `${col.name} is required` };
      if (col.nullable) values[col.name] = null;
      continue; // NOT NULL with a default: leave it out
    }
    if (col.kind === "number") {
      const n = Number(text);
      if (!Number.isFinite(n) || n < 0) return { error: `${col.name} must be a valid number` };
      values[col.name] = n;

    } else {
      if (col.name === "category" && !productCategories.some((c) => c.value === text))
        return { error: "Choose a valid category" };
      values[col.name] = text;
    }
  }
  return { values };
}

export async function listProducts() {
  const [rows]: any = await pool.query("SELECT * FROM products ORDER BY id DESC");
  return rows as Record<string, any>[];
}

export async function getProduct(id: number) {
  const [rows]: any = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
  return (rows[0] ?? null) as Record<string, any> | null;
}

export async function createProduct(values: Record<string, string | number | null>) {
  const keys = Object.keys(values);
  const sql = `INSERT INTO products (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${keys
    .map(() => "?")
    .join(", ")})`;
  const [result]: any = await pool.query(sql, Object.values(values));
  return result.insertId as number;
}

export async function updateProduct(id: number, values: Record<string, string | number | null>) {
  const keys = Object.keys(values);
  if (keys.length === 0) return;
  const sql = `UPDATE products SET ${keys.map((k) => `\`${k}\` = ?`).join(", ")} WHERE id = ?`;
  await pool.query(sql, [...Object.values(values), id]);
}

// Returns false if the product appears in an existing order.
export async function deleteProduct(id: number) {
  const [used]: any = await pool.query(
    "SELECT COUNT(*) AS n FROM order_items WHERE product_id = ?",
    [id]
  );
  if (used[0].n > 0) return false;
  await pool.query("DELETE FROM products WHERE id = ?", [id]);
  return true;
}