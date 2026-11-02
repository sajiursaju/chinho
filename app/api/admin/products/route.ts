import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import { createProduct, parseProductInput } from "@/lib/productAdmin";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = parseProductInput(body);
  if ("error" in parsed)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const id = await createProduct(parsed.data);
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save the product" }, { status: 500 });
  }
}