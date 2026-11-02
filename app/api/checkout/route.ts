import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in to check out" }, { status: 401 });
  }

  if (session.role === "admin") {
    return NextResponse.json(
      { error: "Admin accounts can't place orders. Use a customer account to shop." },
      { status: 403 }
    );
  }

  const { items } = await request.json().catch(() => ({ items: null }));
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;
    const lines: { id: number; name: string; price: number; quantity: number }[] = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid quantity");
      }
      // read the real price from the database, not from the browser
      const [rows]: any = await conn.query(
        "SELECT id, name, price FROM products WHERE id = ?",
        [item.id]
      );
      const product = rows[0];
      if (!product) throw new Error("Product not found");

      const price = Number(product.price);
      total += price * quantity;
      lines.push({ id: product.id, name: product.name, price, quantity });
    }

    const [result]: any = await conn.query(
      "INSERT INTO orders (user_id, total) VALUES (?, ?)",
      [session.id, total.toFixed(2)]
    );
    const orderId = result.insertId;

    for (const line of lines) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)",
        [orderId, line.id, line.name, line.price, line.quantity]
      );
    }

    await conn.commit();
    return NextResponse.json({ message: "Order placed", orderId }, { status: 201 });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return NextResponse.json({ error: "Could not place order" }, { status: 500 });
  } finally {
    conn.release();
  }
}