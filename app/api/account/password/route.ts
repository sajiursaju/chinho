import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const { currentPassword, newPassword } = await request.json().catch(() => ({}));

  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return NextResponse.json({ error: "Both passwords are required" }, { status: 400 });
  }
  if (newPassword.length < 8 || newPassword.length > 72) {
    return NextResponse.json({ error: "New password must be 8 to 72 characters" }, { status: 400 });
  }

  const [rows]: any = await pool.query("SELECT password_hash FROM users WHERE id = ?", [session.id]);
  const user = rows[0];
  const valid = user && (await bcrypt.compare(currentPassword, user.password_hash));
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, session.id]);
  return NextResponse.json({ message: "Password updated" });
}