import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { createSession, getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";

  if (name.length < 1 || name.length > 100)
    return NextResponse.json({ error: "Name is required (max 100 characters)" }, { status: 400 });
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });

  if (session.role === "admin") {
    const [rows]: any = await pool.query(
      "SELECT email, password_hash FROM admins WHERE id = ? LIMIT 1",
      [session.id]
    );
    const admin = rows[0];
    if (!admin) return NextResponse.json({ error: "Admin account not found" }, { status: 404 });

    if (email !== admin.email) {
      if (!(await bcrypt.compare(currentPassword, admin.password_hash))) {
        return NextResponse.json({ error: "Enter your current password to change your email" }, { status: 400 });
      }
      const [taken]: any = await pool.query(
        "SELECT id FROM admins WHERE email = ? AND id <> ? LIMIT 1",
        [email, session.id]
      );
      if (taken.length) return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
    }

    await pool.query("UPDATE admins SET name = ?, email = ? WHERE id = ?", [name, email, session.id]);
    await createSession({ id: session.id, name, role: "admin" });
    return NextResponse.json({ message: "Admin profile updated" });
  }

  if (phone && !/^[0-9+\-() ]{5,30}$/.test(phone))
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  if (address.length > 255)
    return NextResponse.json({ error: "Address is too long (max 255 characters)" }, { status: 400 });

  const [rows]: any = await pool.query(
    "SELECT email, password_hash, role FROM users WHERE id = ? LIMIT 1",
    [session.id]
  );
  const user = rows[0];
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  if (email !== user.email) {
    if (!(await bcrypt.compare(currentPassword, user.password_hash)))
      return NextResponse.json({ error: "Enter your current password to change your email" }, { status: 400 });
    const [taken]: any = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
      [email, session.id]
    );
    if (taken.length) return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
  }

  await pool.query(
    "UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
    [name, email, phone || null, address || null, session.id]
  );
  await createSession({ id: session.id, name, role: user.role });
  return NextResponse.json({ message: "Profile updated" });
}
