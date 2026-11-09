import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const [rows]: any = await pool.query(
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
        { error: "Invalid admin email or password" },
        { status: 401 }
      );
    }

    await createSession({
      id: Number(admin.id),
      name: admin.name,
      role: "admin",
    });

    return NextResponse.json({ message: "Logged in" });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
