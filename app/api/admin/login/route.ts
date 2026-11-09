import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
<<<<<<< HEAD
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
=======
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
>>>>>>> d87f42b (admin more element added)
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.query(
<<<<<<< HEAD
      "SELECT id, name, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = rows[0];

    // Keep the response generic so this endpoint does not reveal whether an
    // email exists or whether it belongs to a non-admin account.
    if (
      !user ||
      user.role !== "admin" ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return NextResponse.json(
        { error: "Invalid email or password, or account is not an admin" },
=======
      "SELECT id, name, email, password_hash FROM admins WHERE email = ? LIMIT 1",
      [email]
    );

    const admin = rows[0];

    if (
      !admin ||
      typeof admin.password_hash !== "string" ||
      !(await bcrypt.compare(password, admin.password_hash))
    ) {
      return NextResponse.json(
        { error: "Invalid email or password" },
>>>>>>> d87f42b (admin more element added)
        { status: 401 }
      );
    }

    await createSession({
<<<<<<< HEAD
      id: Number(user.id),
      name: user.name,
=======
      id: Number(admin.id),
      name: admin.name,
>>>>>>> d87f42b (admin more element added)
      role: "admin",
    });

    return NextResponse.json({ message: "Logged in" });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> d87f42b (admin more element added)
