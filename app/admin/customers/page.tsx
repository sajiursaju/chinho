import { getAllCustomers } from "@/lib/customers";

export default async function AdminCustomersPage() {
  const customers = await getAllCustomers();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Customers</h1>

      {customers.length === 0 ? (
        <p>No customers have placed an order yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b font-semibold">
              <tr>
                <th className="py-2">ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Total spent</th>
                <th>Last order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2">#{c.id}</td>
                  <td>{c.name ?? "—"}</td>
                  <td>{c.email}</td>
                  <td>{c.order_count}</td>
                  <td>${c.total_spent.toFixed(2)}</td>
                  <td>
                    {c.last_order
                      ? new Date(c.last_order).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}