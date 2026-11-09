import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrdersForUser } from "@/lib/orders";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/shopSettings";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const orders = await getOrdersForUser(session.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <p>
          You have no orders yet. <Link href="/" className="underline">Start shopping</Link>
        </p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  {order.created_at && (
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">৳{Number(order.total).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Delivery: {order.delivery_area === "outside_dhaka" ? "Outside Dhaka" : "Dhaka"}</p>
                </div>
              </div>

              <div className="mb-3 grid gap-3 text-sm text-gray-600 md:grid-cols-3">
                <div><span className="font-medium text-gray-800">Status:</span> {order.status || "pending"}</div>
                <div><span className="font-medium text-gray-800">Payment:</span> {paymentMethodLabel(order.payment_method)}</div>
                <div><span className="font-medium text-gray-800">Payment status:</span> {paymentStatusLabel(order.payment_status)}</div>
              </div>

              {order.tracking_number && (
                <p className="mb-3 text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Tracking:</span> {order.tracking_number}
                </p>
              )}

              {order.payment_reference && (
                <p className="mb-3 text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Reference:</span> {order.payment_reference}
                </p>
              )}

              <ul className="divide-y text-sm">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between py-2">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 border-t pt-3 text-sm text-gray-600">
                <p>Delivery area: {order.delivery_area === "outside_dhaka" ? "Outside Dhaka" : "Dhaka"}</p>
                <p>Delivery charge: ৳{Number(order.delivery_charge ?? 0).toFixed(2)}</p>
                <p>Address: {order.customer_address || "Not provided"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
