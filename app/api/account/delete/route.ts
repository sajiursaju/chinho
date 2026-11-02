import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { deleteSession, getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const { password, confirm } = await request.json().catch(() => ({}));
  if (confirm !== "DELETE")
    return NextResponse.json({ error: "Type DELETE to confirm" }, { status: 400 });

  const [rows]: any = await pool.query(
    "SELECT password_hash, role FROM users WHERE id = ?",
    [session.id]
  );
  const user = rows[0];
  const ok = user && typeof password === "string" && (await bcrypt.compare(password, user.password_hash));
  if (!ok) return NextResponse.json({ error: "Password is incorrect" }, { status: 400 });

  // Never delete the last admin
  if (user.role === "admin") {
    const [admins]: any = await pool.query("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'");
    if (admins[0].n <= 1)
      return NextResponse.json(
        { error: "You are the only admin. Make another user an admin first." },
        { status: 409 }
      );
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      "DELETE oi FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.user_id = ?",
      [session.id]
    );
    await conn.query("DELETE FROM orders WHERE user_id = ?", [session.id]);
    try {
      await conn.query("DELETE FROM password_resets WHERE user_id = ?", [session.id]);
    } catch {
      // table doesn't exist yet: nothing to clean up
    }
    await conn.query("DELETE FROM users WHERE id = ?", [session.id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return NextResponse.json({ error: "Could not delete account" }, { status: 500 });
  } finally {
    conn.release();
  }

  await deleteSession();
  return NextResponse.json({ message: "Account deleted" });
}