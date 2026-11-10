import Link from "next/link";
import { pool } from "@/lib/db";
import SalesOverview from "./components/SalesOverview";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";

interface DashboardStats {
  products: number | string;
  customers: number | string;
  orders: number | string;
  revenue: number | string;
}

interface RecentOrder {
  id: number;
  total: number | string;
  customer_name: string;
}

interface TopProduct {
  product_id: number;
  name: string;
  sold: number | string;
  revenue: number | string;
}

interface SalesRow {
  sale_date: string | Date;
  revenue: number | string;
}

export default async function AdminDashboard() {
  const [statRows]: any = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customers,
      (SELECT COUNT(*)
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       WHERE u.id IS NULL OR u.role <> 'admin') AS orders,
      (SELECT COALESCE(SUM(o.total), 0)
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       WHERE u.id IS NULL OR u.role <> 'admin') AS revenue
  `);

  const stats: DashboardStats = statRows[0];
  const productCount = Number(stats.products);
  const customerCount = Number(stats.customers);
  const orderCount = Number(stats.orders);
  const totalRevenue = Number(stats.revenue);
  const averageOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

  const [salesRows]: any = await pool.query(`
    SELECT DATE(o.created_at) AS sale_date, COALESCE(SUM(o.total), 0) AS revenue
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE (u.id IS NULL OR u.role <> 'admin')
      AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
      AND o.created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
    GROUP BY DATE(o.created_at)
    ORDER BY sale_date ASC
  `);

  const salesData = (salesRows as SalesRow[]).map((row) => {
    const date =
      typeof row.sale_date === "string"
        ? row.sale_date.slice(0, 10)
        : row.sale_date.toISOString().slice(0, 10);

    return {
      date: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      revenue: Number(row.revenue),
    };
  });

  const [recent]: any = await pool.query(`
    SELECT o.id, o.total, COALESCE(u.name, 'Guest') AS customer_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE u.id IS NULL OR u.role <> 'admin'
    ORDER BY o.id DESC
    LIMIT 5
  `);

  const [top]: any = await pool.query(`
    SELECT oi.product_id, oi.name,
      SUM(oi.quantity) AS sold,
      SUM(oi.price * oi.quantity) AS revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    LEFT JOIN users u ON u.id = o.user_id
    WHERE u.id IS NULL OR u.role <> 'admin'
    GROUP BY oi.product_id, oi.name
    ORDER BY sold DESC
    LIMIT 5
  `);

  // ✅ FIX 1: use formatPrice() instead of `$${...toFixed(2)}`
  const cards = [
    { label: "Total revenue", value: formatPrice(totalRevenue) },
    { label: "Orders", value: orderCount.toLocaleString() },
    { label: "Customers", value: customerCount.toLocaleString() },
    { label: "Products", value: productCount.toLocaleString() },
    { label: "Average order", value: formatPrice(averageOrder) },
  ];

  const shortcuts = [
    { label: "Add product", href: "/admin/products/new", primary: true },
    { label: "Manage products", href: "/admin/products" },
    { label: "Customer orders", href: "/admin/orders" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Categories", href: "/admin/categories" },
    { label: "Inventory", href: "/admin/inventory" },
    { label: "Discounts", href: "/admin/discounts" },
    { label: "Reviews", href: "/admin/reviews" },
    { label: "Reports", href: "/admin/reports" },
    { label: "Store settings", href: "/admin/settings" },
    { label: "Homepage Slides", href: "/admin/slides" },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/discounts"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            Discounts &amp; Offers
          </Link>

          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            <span aria-hidden="true">⚙</span>
            Payments &amp; Delivery Settings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <section className="min-w-0">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Dashboard Statistics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {cards.map((card) => (
              <div
                key={card.label}
                className="flex min-h-28 flex-col justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-2 break-words text-xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="min-w-0">
          <SalesOverview data={salesData} />
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="text-sm text-gray-500">No customer orders yet.</p>
          ) : (
            <ul className="divide-y text-sm">
              {recent.map((order: RecentOrder) => (
                <li
                  key={order.id}
                  className="flex justify-between gap-3 py-3"
                >
                  <span className="min-w-0 truncate text-gray-700">
                    #{order.id} · {order.customer_name}
                  </span>
                  {/* ✅ FIX 2: recent orders price */}
                  <span className="shrink-0 font-medium">
                    {formatPrice(Number(order.total))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">
            Best selling products
          </h2>

          {top.length === 0 ? (
            <p className="text-sm text-gray-500">No sales yet.</p>
          ) : (
            <ul className="divide-y text-sm">
              {top.map((product: TopProduct) => (
                <li
                  key={product.product_id}
                  className="flex justify-between gap-3 py-3"
                >
                  <span className="min-w-0 truncate text-gray-700">
                    {product.name} × {Number(product.sold)}
                  </span>
                  {/* ✅ FIX 3: best selling products price */}
                  <span className="shrink-0 font-medium">
                    {formatPrice(Number(product.revenue))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">
          Store management
        </h2>
        <div className="flex flex-wrap gap-3">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className={
                shortcut.primary
                  ? "rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
                  : "rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-50"
              }
            >
              {shortcut.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}