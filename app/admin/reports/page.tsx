import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/adminProducts";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const admin = await requireAdmin();

  if (!admin) {
    return (
      <main className="p-6">
        <p className="text-gray-700">Admin access required.</p>
      </main>
    );
  }

  let totalOrders = 0;
  let revenue = 0;
  let totalProducts = 0;

  try {
    const [orders]: any = await pool.query(
      "SELECT COUNT(*) AS total_orders, COALESCE(SUM(total), 0) AS revenue FROM orders"
    );
    totalOrders = Number(orders[0]?.total_orders ?? 0);
    revenue = Number(orders[0]?.revenue ?? 0);
  } catch {
    totalOrders = 0;
    revenue = 0;
  }

  try {
    const [products]: any = await pool.query(
      "SELECT COUNT(*) AS total_products FROM products"
    );
    totalProducts = Number(products[0]?.total_products ?? 0);
  } catch {
    totalProducts = 0;
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">
          Overview of sales, products, and store activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total orders</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalOrders}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">${revenue.toFixed(2)}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Products</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalProducts}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          More detailed analytics will be added once your sales data is connected.
        </p>
      </section>
    </main>
  );
}
