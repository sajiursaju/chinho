import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminProducts";
import { updateOrderStatus } from "@/lib/orders";

const ALLOWED_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // 1. Only admins may change orders
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Validate the order id from the URL
  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  // 3. Read and validate the body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = String(body?.status ?? "").toLowerCase();
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const rawTracking =
    typeof body?.trackingNumber === "string" ? body.trackingNumber.trim() : "";
  if (rawTracking.length > 100) {
    return NextResponse.json(
      { error: "Tracking number is too long" },
      { status: 400 }
    );
  }
  const trackingNumber = rawTracking === "" ? null : rawTracking;

  // 4. Update the database through your existing helper
  const updated = await updateOrderStatus(orderId, status, trackingNumber);
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}