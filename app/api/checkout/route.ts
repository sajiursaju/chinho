import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";
import { calculateDeliveryCharge, getShopSettings, normalizeDeliveryArea, normalizePaymentMethod } from "@/lib/shopSettings";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in to check out" }, { status: 401 });
  if (session.role === "admin") return NextResponse.json({ error: "Admin accounts can't place orders." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length || items.length > 100) return NextResponse.json({ error: "Your cart is empty or invalid" }, { status: 400 });

  const paymentMethod = normalizePaymentMethod(body.paymentMethod);
  const deliveryArea = normalizeDeliveryArea(body.deliveryArea);
  if (!paymentMethod || !deliveryArea) return NextResponse.json({ error: "Choose a valid payment method and delivery area." }, { status: 400 });

  const customerName = String(body.customerName ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const customerAddress = String(body.customerAddress ?? "").trim();
  const paymentReference = String(body.paymentReference ?? "").trim();
  const paymentNote = String(body.paymentNote ?? "").trim();
  if (!customerName || customerName.length > 100 || !customerPhone || customerPhone.length > 30 || !customerAddress || customerAddress.length > 1000) {
    return NextResponse.json({ error: "Enter a valid name, phone number, and delivery address." }, { status: 400 });
  }
  if (paymentReference.length > 120 || paymentNote.length > 100) return NextResponse.json({ error: "Payment details are too long." }, { status: 400 });

  const settings = await getShopSettings();
  if (paymentMethod === "cod" && !settings.enableCod) return NextResponse.json({ error: "Cash on delivery is not available." }, { status: 400 });
  if (paymentMethod === "bkash" && !settings.enableBkash) return NextResponse.json({ error: "bKash is not available." }, { status: 400 });
  if (paymentMethod === "nagad" && !settings.enableNagad) return NextResponse.json({ error: "Nagad is not available." }, { status: 400 });
  if (paymentMethod !== "cod" && !paymentReference) return NextResponse.json({ error: "Enter the wallet transaction ID/reference." }, { status: 400 });

  const wallet = paymentMethod === "bkash"
    ? { account: settings.bkashNumber, action: settings.bkashAction, instruction: settings.bkashInstruction }
    : paymentMethod === "nagad"
      ? { account: settings.nagadNumber, action: settings.nagadAction, instruction: settings.nagadInstruction }
      : null;
  if (wallet && !wallet.account) return NextResponse.json({ error: "This payment method is not configured. Contact the store." }, { status: 400 });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let subtotal = 0;
    const lines: { id: number; name: string; price: number; quantity: number }[] = [];

    for (const item of items) {
      const productId = Number(item.id);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Invalid product or quantity");
      const [rows]: any = await conn.query("SELECT id, name, price FROM products WHERE id = ?", [productId]);
      const product = rows[0];
      if (!product) throw new Error("Product not found");
      const price = Number(product.price);
      subtotal += price * quantity;
      lines.push({ id: Number(product.id), name: product.name, price, quantity });
    }

    const deliveryCharge = calculateDeliveryCharge(settings, subtotal, deliveryArea);
    const total = subtotal + deliveryCharge;
    const paymentStatus = paymentMethod === "cod" ? "pending" : "pending";
    const [result]: any = await conn.query(
      `INSERT INTO orders (
        user_id, total, status, delivery_area, delivery_charge, payment_method,
        payment_status, customer_name, customer_phone, customer_address,
        payment_reference, payment_note, payment_account, payment_action, payment_instruction
      ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [session.id, total.toFixed(2), deliveryArea, deliveryCharge.toFixed(2), paymentMethod, paymentStatus,
        customerName, customerPhone, customerAddress, paymentReference || null, paymentNote || null,
        wallet?.account ?? null, wallet?.action ?? null, wallet?.instruction ?? settings.codInstruction]
    );

    const orderId = Number(result.insertId);
    for (const line of lines) {
      await conn.query("INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)", [orderId, line.id, line.name, line.price, line.quantity]);
    }
    await conn.commit();
    return NextResponse.json({ message: "Order placed", orderId, subtotal, deliveryCharge, total }, { status: 201 });
  } catch (error) {
    await conn.rollback();
    console.error("Checkout failed:", error);
    return NextResponse.json({ error: "Could not place order. Please try again." }, { status: 500 });
  } finally {
    conn.release();
  }
}
