// components/account/OrderHistory.tsx
import { formatPrice } from "@/lib/currency";

type Order = {
  id: number;
  total: number | string; // MySQL DECIMAL can arrive as a string
  status: string;
  tracking_number: string | null;
  created_at: string | Date;
};

type Props = {
  orders: Order[];
};

export default function OrderHistory({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400 text-sm">
        You have no orders yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Order History</h3>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            <th className="px-6 py-3 text-left">Order #</th>
            <th className="px-6 py-3 text-left">Date</th>
            <th className="px-6 py-3 text-left">Total</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Tracking</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-3 font-medium text-indigo-600">
                #{order.id}
              </td>
              <td className="px-6 py-3 text-gray-500">
                {new Date(order.created_at).toLocaleDateString("en-GB")}
              </td>
              {/* was ৳{Number(order.total).toFixed(2)} */}
              <td className="px-6 py-3">{formatPrice(order.total)}</td>
              <td className="px-6 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-3 text-gray-400">
                {order.tracking_number ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}