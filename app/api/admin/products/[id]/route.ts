import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import { deleteProduct, parseProductInput, updateProduct } from "@/lib/productAdmin";

type Ctx = { params: Promise<{ id: string }> };

async function readId(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PUT(request: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = await readId(ctx);
  if (!id) return NextResponse.json({ error: "Invalid product" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = parseProductInput(body);
  if ("error" in parsed)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const found = await updateProduct(id, parsed.data);
    if (!found) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ message: "Product updated" });
  } catch {
    return NextResponse.json({ error: "Could not update the product" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = await readId(ctx);
  if (!id) return NextResponse.json({ error: "Invalid product" }, { status: 400 });

  try {
    const found = await deleteProduct(id);
    if (!found) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ message: "Product deleted" });
  } catch (e: any) {
    // The product is already inside customer orders
    if (e?.code === "ER_ROW_IS_REFERENCED_2") {
      return NextResponse.json(
        { error: "This product is in customer orders, so it cannot be deleted." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Could not delete the product" }, { status: 500 });
  }
}