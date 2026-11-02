import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import { updateOrderStatus } from "@/lib/orders";
import { isOrderStatus } from "@/lib/orderStatus";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const status = String(body?.status ?? "").trim().toLowerCase();
  if (!isOrderStatus(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const tracking = String(body?.tracking_number ?? "").trim();
  if (tracking.length > 100) {
    return NextResponse.json(
      { error: "Tracking number is too long" },
      { status: 400 }
    );
  }

  const updated = await updateOrderStatus(
    orderId,
    status,
    tracking === "" ? null : tracking
  );
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}