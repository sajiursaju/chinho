import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import { deleteProduct } from "@/lib/productAdmin";

// The most products that can be deleted in one request.
const MAX_BULK = 100;

// Receives { "ids": [1, 2, 3] } and deletes each product.
// Products that are already in a customer order are skipped and reported back.
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);

  // Keep only whole numbers above zero, and remove duplicates.
  const rawIds: unknown[] = Array.isArray(body?.ids) ? body.ids : [];
  const ids = [...new Set(rawIds.map((v) => Number(v)))].filter(
    (id) => Number.isInteger(id) && id > 0
  );

  if (ids.length === 0)
    return NextResponse.json({ error: "No valid products selected." }, { status: 400 });
  if (ids.length > MAX_BULK)
    return NextResponse.json(
      { error: `You can delete at most ${MAX_BULK} products at once.` },
      { status: 400 }
    );

  const deleted: number[] = [];
  const skipped: number[] = [];

  // Each product is handled on its own, so one protected product doesn't stop the rest.
  for (const id of ids) {
    try {
      const ok = await deleteProduct(id);
      if (ok) deleted.push(id);
      else skipped.push(id); // not found
    } catch (e: any) {
      // ER_ROW_IS_REFERENCED_2: the product is already inside a customer order.
      if (e?.code !== "ER_ROW_IS_REFERENCED_2") console.error(e);
      skipped.push(id);
    }
  }

  return NextResponse.json({ deleted: deleted.length, skipped });
}
