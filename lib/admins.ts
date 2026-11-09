import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

export type Admin = {
  id: number;
  name: string;
  email: string;
};

export type AdminForLogin = Admin & {
  password_hash: string;
};

export async function getAdminByEmail(
  email: string
): Promise<AdminForLogin | null> {
  const [rows] = await pool.query<(AdminForLogin & RowDataPacket)[]>(
    `SELECT id, name, email, password_hash
     FROM admins
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] ?? null;
}

export async function getAdminById(id: number): Promise<Admin | null> {
  const [rows] = await pool.query<(Admin & RowDataPacket)[]>(
    `SELECT id, name, email
     FROM admins
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}