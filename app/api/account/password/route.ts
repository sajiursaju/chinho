import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword)
    return NextResponse.json({ error: "Both passwords are required" }, { status: 400 });
  if (newPassword.length < 8 || newPassword.length > 72)
    return NextResponse.json({ error: "New password must be 8 to 72 characters" }, { status: 400 });

  const table = session.role === "admin" ? "admins" : "users";
  const [rows]: any = await pool.query(
    `SELECT password_hash FROM ${table} WHERE id = ? LIMIT 1`,
    [session.id]
  );
  const account = rows[0];
  if (!account || !(await bcrypt.compare(currentPassword, account.password_hash))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query(`UPDATE ${table} SET password_hash = ? WHERE id = ?`, [hash, session.id]);
  return NextResponse.json({ message: "Password updated" });
}
