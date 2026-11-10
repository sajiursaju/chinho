import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrdersForUser } from "@/lib/orders";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/shopSettings";
import { formatPrice } from "@/lib/currency";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin/orders");
  const orders = await getOrdersForUser(session.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
      {orders.length === 0 ? <p>You have no orders yet. <Link href="/" className="underline">Start shopping</Link></p> : (
        <div className="space-y-6">
          {orders.map((order) => (
            <article key={order.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="font-semibold">Order #{order.id}</h2><p className="text-sm text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleString() : ""}</p></div>
                <div className="text-right"><p className="text-lg font-bold">{formatPrice(order.total)}</p><p className="text-sm capitalize text-gray-600">{order.status || "pending"}</p></div>
              </div>
              <ul className="divide-y text-sm">{order.items.map((item, index) => <li key={`${order.id}-${index}`} className="flex justify-between gap-3 py-2"><span>{item.name} × {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></li>)}</ul>
              <div className="mt-4 grid gap-2 border-t pt-4 text-sm sm:grid-cols-2">
                <p><strong>Payment:</strong> {paymentMethodLabel(order.payment_method)}</p>
                <p><strong>Payment verification:</strong> {paymentStatusLabel(order.payment_status)}</p>
                <p><strong>Delivery area:</strong> {order.delivery_area === "outside_dhaka" ? "Outside Dhaka" : "Dhaka"}</p>
                <p><strong>Delivery charge:</strong> {formatPrice(order.delivery_charge ?? 0)}</p>
                {order.tracking_number && <p><strong>Tracking number:</strong> {order.tracking_number}</p>}
                {order.payment_reference && <p><strong>Transaction reference:</strong> {order.payment_reference}</p>}
                {order.customer_phone && <p><strong>Phone:</strong> {order.customer_phone}</p>}
                {order.customer_address && <p className="sm:col-span-2"><strong>Delivery address:</strong> {order.customer_address}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}