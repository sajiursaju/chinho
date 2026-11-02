import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
};

export async function getUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.query<(User & RowDataPacket)[]>(
    "SELECT id, name, email, password_hash FROM users WHERE email = ?",
    [email]
  );
  return rows[0] ?? null;
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );
  return result.insertId;
}