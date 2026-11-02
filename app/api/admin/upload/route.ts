import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAdmin } from "@/lib/adminProducts";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB, same as the form

// Check the real file bytes, not the file name. SVG is not allowed.
function detectExt(b: Buffer): string | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (
    b.length > 8 &&
    b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "png";
  if (
    b.length > 12 &&
    b.subarray(0, 4).toString("ascii") === "RIFF" &&
    b.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "webp";
  return null;
}

export async function POST(request: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  if (file.size === 0 || file.size > MAX_BYTES)
    return NextResponse.json({ error: "Picture is too big (max 2 MB)" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = detectExt(buffer);
  if (!ext)
    return NextResponse.json(
      { error: "Only JPG, PNG or WebP images are allowed" },
      { status: 400 }
    );

  const name = `${crypto.randomBytes(12).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);

  const publicPath = `/uploads/${name}`;
  return NextResponse.json({ url: publicPath, path: publicPath }, { status: 201 });
}