import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";

const MAX_BYTES = 300 * 1024; // the browser sends about 20-40 KB

// Check the real file bytes, not what the browser claims. SVG is not allowed.
function detectType(b: Buffer): string | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b.length > 8 &&
    b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "image/png";
  if (
    b.length > 12 &&
    b.subarray(0, 4).toString("ascii") === "RIFF" &&
    b.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  return null;
}

export async function GET() {
  const session = await getSession();
  if (!session) return new NextResponse(null, { status: 401 });

  const [rows]: any = await pool.query(
    "SELECT avatar, avatar_type FROM users WHERE id = ?",
    [session.id]
  );
  const row = rows[0];
  if (!row?.avatar) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(row.avatar), {
    headers: {
      "Content-Type": row.avatar_type || "image/jpeg",
      "Cache-Control": "private, no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("avatar");
  if (!(file instanceof File))
    return NextResponse.json({ error: "No image received" }, { status: 400 });
  if (file.size === 0 || file.size > MAX_BYTES)
    return NextResponse.json({ error: "Image is too large" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = detectType(buffer);
  if (!type)
    return NextResponse.json({ error: "Only JPG, PNG or WebP images are allowed" }, { status: 400 });

  await pool.query("UPDATE users SET avatar = ?, avatar_type = ? WHERE id = ?", [
    buffer,
    type,
    session.id,
  ]);
  return NextResponse.json({ message: "Profile picture updated" });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  await pool.query("UPDATE users SET avatar = NULL, avatar_type = NULL WHERE id = ?", [
    session.id,
  ]);
  return NextResponse.json({ message: "Profile picture removed" });
}