// lib/users.ts
// Database helpers for the customer `users` table.
// Used by the signup route. Admins live in the separate `admins` table, not here.
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
};

/**
 * Finds one customer by email. Returns null when no account has this email.
 * Signup uses this to stop two accounts sharing one email.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return (rows[0] as User | undefined) ?? null;
}

/**
 * Creates a new customer and returns the new id.
 * The password must already be hashed (the signup route does bcrypt first).
 * `role` is not set here, so the column default (customer) is used.
 */
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
