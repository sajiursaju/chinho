import { pool } from "@/lib/db";

export type Customer = {
  id: number;
  name: string | null;
  email: string;
  order_count: number;
  total_spent: number;
  last_order: string | Date | null;
};

export async function getAllCustomers(): Promise<Customer[]> {
  const [rows]: any = await pool.query(
    `SELECT u.id, u.name, u.email,
            COUNT(o.id) AS order_count,
            SUM(o.total) AS total_spent,
            MAX(o.created_at) AS last_order
     FROM users u
     INNER JOIN orders o ON o.user_id = u.id
     WHERE u.role = 'customer'
     GROUP BY u.id, u.name, u.email
     ORDER BY total_spent DESC`
  );

  return rows.map((r: any) => ({
    id: r.id,
    name: r.name ?? null,
    email: r.email,
    order_count: Number(r.order_count),
    total_spent: Number(r.total_spent),
    last_order: r.last_order ?? null,
  }));
}