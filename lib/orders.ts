import { pool } from "@/lib/db";

export type OrderItem = { product_id: number; name: string; price: number; quantity: number };
export type Order = {
  id: number;
  total: number;
  created_at?: string | Date | null;
  status?: string | null;
  tracking_number?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;
  delivery_area?: string | null;
  delivery_charge?: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
  payment_reference?: string | null;
  payment_note?: string | null;
  payment_account?: string | null;
  payment_action?: string | null;
  payment_instruction?: string | null;
  items: OrderItem[];
};

async function attachItems(orders: any[]): Promise<Order[]> {
  if (!orders.length) return [];
  const ids = orders.map((o) => o.id);
  const [items]: any = await pool.query("SELECT order_id, product_id, name, price, quantity FROM order_items WHERE order_id IN (?)", [ids]);
  return orders.map((o) => ({
    id: Number(o.id), total: Number(o.total), created_at: o.created_at ?? null,
    status: o.status ?? null, tracking_number: o.tracking_number ?? null,
    customer_name: o.customer_name ?? null, customer_phone: o.customer_phone ?? null,
    customer_address: o.customer_address ?? null, delivery_area: o.delivery_area ?? null,
    delivery_charge: o.delivery_charge == null ? null : Number(o.delivery_charge),
    payment_method: o.payment_method ?? null, payment_status: o.payment_status ?? null,
    payment_reference: o.payment_reference ?? null, payment_note: o.payment_note ?? null,
    payment_account: o.payment_account ?? null, payment_action: o.payment_action ?? null,
    payment_instruction: o.payment_instruction ?? null,
    items: items.filter((i: any) => Number(i.order_id) === Number(o.id)).map((i: any) => ({ ...i, price: Number(i.price) })),
  }));
}

export async function getOrdersForUser(userId: number) {
  const [orders]: any = await pool.query("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", [userId]);
  return attachItems(orders);
}

export async function getAllOrders() {
  const [orders]: any = await pool.query(`SELECT o.*, u.name AS customer_name FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.id DESC`);
  return attachItems(orders);
}

export async function updateOrderStatus(orderId: number, status: string, trackingNumber: string | null, paymentStatus?: string): Promise<boolean> {
  const [result]: any = await pool.query(
    "UPDATE orders SET status = ?, tracking_number = ?, payment_status = COALESCE(?, payment_status) WHERE id = ?",
    [status, trackingNumber, paymentStatus ?? null, orderId]
  );
  return result.affectedRows > 0;
}
