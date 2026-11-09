import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();

    // Admins use the separate admin panel, not the customer account menu.
    if (!session || session.role === "admin") {
      return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
    }

    const [rows]: any = await pool.query(
      `SELECT id, name, role,
              (avatar IS NOT NULL AND OCTET_LENGTH(avatar) > 0) AS hasAvatar
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [session.id]
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json(
      {
        user: {
          id: Number(user.id),
          name: user.name,
          role: user.role,
          hasAvatar: Boolean(user.hasAvatar),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Could not load current user:", error);
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  }
}
