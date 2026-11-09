import { requireAdmin } from "@/lib/adminProducts";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/currency";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/shopSettings";

export const dynamic = "force-dynamic";

function statusClass(status?: string | null) {
  switch ((status ?? "").toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-700";
    case "shipped":
      return "bg-blue-100 text-blue-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">All Orders</h1>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b font-semibold">
              <tr>
                <th className="py-2">Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th>Price</th>
                <th>Status</th>
                <th>Update</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b align-top">
                  <td className="py-2">#{o.id}</td>
                  <td>
                    <div className="font-medium">{o.customer_name ?? "—"}</div>
                    <div className="text-xs text-gray-500">{o.customer_phone ?? "No phone"}</div>
                  </td>
                  <td>
                    {o.items.map((it, i) => (
                      <div key={i}>
                        {it.name} × {it.quantity}
                      </div>
                    ))}
                  </td>
                  <td>
                    <div>{paymentMethodLabel(o.payment_method)}</div>
                    <div className="text-xs text-gray-500">{paymentStatusLabel(o.payment_status)}</div>
                    {o.payment_reference && <div className="text-xs text-gray-500">Ref: {o.payment_reference}</div>}
                  </td>
                  <td>
                    <div>{o.delivery_area === "outside_dhaka" ? "Outside Dhaka" : "Dhaka"}</div>
                    <div className="text-xs text-gray-500">Charge: {formatPrice(Number(o.delivery_charge ?? 0))}</div>
                  </td>
                  <td>{formatPrice(o.total)}</td>
                  <td>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(o.status)}`}>
                      {o.status ?? "pending"}
                    </span>
                  </td>
                  <td className="py-2">
                    <OrderStatusForm orderId={o.id} currentStatus={o.status} currentTracking={o.tracking_number} />
                  </td>
                  <td>{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
