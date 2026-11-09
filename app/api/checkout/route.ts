import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";
import { calculateDeliveryCharge, getShopSettings, normalizeDeliveryArea, normalizePaymentMethod, ensureShopSettingsTable } from "@/lib/shopSettings";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role === "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  const paymentMethod = normalizePaymentMethod(body.paymentMethod);
  const deliveryArea = normalizeDeliveryArea(body.deliveryArea);
  const customerName = String(body.customerName ?? session.name).trim() || session.name;
  const customerPhone = String(body.customerPhone ?? "").trim();
  const customerAddress = String(body.customerAddress ?? "").trim();
  const paymentReference = String(body.paymentReference ?? "").trim();
  const paymentNote = String(body.paymentNote ?? "").trim();

  const settings = await getShopSettings();

  if (paymentMethod === "cod" && !settings.enableCod) {
    return NextResponse.json({ error: "Cash on delivery is not available right now." }, { status: 400 });
  }
  if (paymentMethod === "bkash" && !settings.enableBkash) {
    return NextResponse.json({ error: "bKash payment is not available right now." }, { status: 400 });
  }
  if (paymentMethod === "nagad" && !settings.enableNagad) {
    return NextResponse.json({ error: "Nagad payment is not available right now." }, { status: 400 });
  }

  if (!customerPhone || !customerAddress) {
    return NextResponse.json({ error: "Please provide delivery phone and address." }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await ensureShopSettingsTable();

    let subtotal = 0;
    const lines: { id: number; name: string; price: number; quantity: number }[] = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid quantity");
      }

      const [rows]: any = await conn.query(
        "SELECT id, name, price FROM products WHERE id = ?",
        [item.id]
      );
      const product = rows[0];
      if (!product) throw new Error("Product not found");

      const price = Number(product.price);
      subtotal += price * quantity;
      lines.push({ id: product.id, name: product.name, price, quantity });
    }

    const deliveryCharge = calculateDeliveryCharge(settings, subtotal, deliveryArea);
    const total = subtotal + deliveryCharge;

    const [result]: any = await conn.query(
      `INSERT INTO orders (
        user_id, total, status, delivery_area, delivery_charge,
        payment_method, payment_status, customer_name, customer_phone,
        customer_address, payment_reference, payment_note
      ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        total.toFixed(2),
        deliveryArea,
        deliveryCharge.toFixed(2),
        paymentMethod,
        paymentMethod === "cod" ? "pending" : "pending",
        customerName,
        customerPhone,
        customerAddress,
        paymentReference || null,
        paymentNote || null,
      ]
    );

    const orderId = result.insertId;

    for (const line of lines) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)",
        [orderId, line.id, line.name, line.price, line.quantity]
      );
    }

    await conn.commit();
    return NextResponse.json({ message: "Order placed", orderId, total }, { status: 201 });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return NextResponse.json({ error: "Could not place order" }, { status: 500 });
  } finally {
    conn.release();
  }
}
