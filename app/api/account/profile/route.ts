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
  if (phone && !/^[0-9+\-() ]{5,30}$/.test(phone))
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  if (address.length > 255)
    return NextResponse.json({ error: "Address is too long (max 255 characters)" }, { status: 400 });

  const [rows]: any = await pool.query(
    "SELECT email, password_hash, role FROM users WHERE id = ?",
    [session.id]
  );
  const user = rows[0];
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  // Changing the email needs the current password
  if (email !== user.email) {
    const ok = currentPassword && (await bcrypt.compare(currentPassword, user.password_hash));
    if (!ok)
      return NextResponse.json(
        { error: "Enter your current password to change your email" },
        { status: 400 }
      );
    const [taken]: any = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id <> ?",
      [email, session.id]
    );
    if (taken.length > 0)
      return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
  }

  await pool.query(
    "UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
    [name, email, phone || null, address || null, session.id]
  );

  // Refresh the cookie so the new name shows up everywhere
  await createSession({ id: session.id, name, role: user.role });
  return NextResponse.json({ message: "Profile updated" });
}