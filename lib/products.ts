import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string | null;
};

export async function getProducts(): Promise<Product[]> {
  const [rows] = await pool.query<(Product & RowDataPacket)[]>(
    "SELECT id, name, price, image FROM products ORDER BY id"
  );
  return rows;
}

export async function getProductById(id: number): Promise<Product | null> {
  const [rows] = await pool.query<(Product & RowDataPacket)[]>(
    "SELECT id, name, price, image FROM products WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
}