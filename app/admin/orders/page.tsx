import { requireAdmin } from "@/lib/adminProducts";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/currency";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/shopSettings";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const admin = await requireAdmin();
  if (!admin) return <p className="p-6">Admin access required.</p>;
  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">All Orders</h1>
      {orders.length === 0 ? <p>No orders yet.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b font-semibold"><tr><th className="py-2">Order #</th><th>Customer / delivery</th><th>Items</th><th>Payment</th><th>Delivery</th><th>Price</th><th>Status</th><th>Update</th><th>Date</th></tr></thead>
            <tbody>{orders.map((order) => (
              <tr key={order.id} className="border-b align-top">
                <td className="py-2">#{order.id}</td>
                <td><div className="font-medium">{order.customer_name ?? "—"}</div><div>{order.customer_phone ?? "No phone"}</div><div className="max-w-52 whitespace-normal text-xs text-gray-500">{order.customer_address}</div></td>
                <td>{order.items.map((item, index) => <div key={`${order.id}-${index}`}>{item.name} × {item.quantity}</div>)}</td>
                <td><div>{paymentMethodLabel(order.payment_method)}</div><div className="text-xs">{paymentStatusLabel(order.payment_status)}</div>{order.payment_reference && <div className="text-xs">Ref: {order.payment_reference}</div>}{order.payment_note && <div className="text-xs">Sender: {order.payment_note}</div>}{order.payment_account && <div className="text-xs">To: {order.payment_account} ({order.payment_action})</div>}</td>
                <td>{order.delivery_area === "outside_dhaka" ? "Outside Dhaka" : "Dhaka"}<div className="text-xs">Charge: {formatPrice(Number(order.delivery_charge ?? 0))}</div></td>
                <td>{formatPrice(order.total)}</td>
                <td className="capitalize">{order.status ?? "pending"}</td>
                <td className="py-2"><OrderStatusForm orderId={order.id} currentStatus={order.status} currentTracking={order.tracking_number} currentPaymentStatus={order.payment_status} /></td>
                <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
