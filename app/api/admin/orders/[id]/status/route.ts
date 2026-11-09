import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import { updateOrderStatus } from "@/lib/orders";

const ALLOWED_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const ALLOWED_PAYMENT_STATUSES = ["pending", "confirmed", "rejected", "paid"];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const status = String(body.status ?? "").trim().toLowerCase();
  const paymentStatus = String(body.paymentStatus ?? "pending").trim().toLowerCase();
  const tracking = typeof body.trackingNumber === "string" ? body.trackingNumber.trim() : "";
  if (!ALLOWED_STATUSES.includes(status)) return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
  if (tracking.length > 100) return NextResponse.json({ error: "Tracking number is too long" }, { status: 400 });

  const updated = await updateOrderStatus(orderId, status, tracking || null, paymentStatus);
  if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
