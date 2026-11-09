import Link from "next/link";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/adminProducts";
import AccountForms from "./AccountForms";

export const dynamic = "force-dynamic";

async function count(sql: string) {
  try {
    const [rows]: any = await pool.query(sql);
    return Number(rows[0]?.total ?? 0);
  } catch {
    return 0;
  }
}

export default async function AdminAccountPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const [rows]: any = await pool.query(
    "SELECT id, name, email FROM admins WHERE id = ? LIMIT 1",
    [admin.id]
  );
  const profile = rows[0];
  if (!profile) redirect("/");

  const [products, customers, orders] = await Promise.all([
    count("SELECT COUNT(*) AS total FROM products"),
    count("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'"),
    count("SELECT COUNT(*) AS total FROM orders"),
  ]);

  const stats = [
    { label: "Products", value: products },
    { label: "Customers", value: customers },
    { label: "Orders", value: orders },
  ];
  const access = [
    { label: "Manage products", href: "/admin/products", icon: "□" },
    { label: "Add new product", href: "/admin/products/new", icon: "+" },
    { label: "Manage orders", href: "/admin/orders", icon: "▤" },
    { label: "Manage customers", href: "/admin/customers", icon: "♙" },
    { label: "View store", href: "/", icon: "↗" },
  ];
  const permissions = ["Products", "Orders", "Customers", "Categories", "Dashboard"];

  return (
    <main className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">My account</h2>
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-gray-900 via-indigo-900 to-violet-700" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-900 text-4xl font-bold text-white shadow-md">
                {String(profile.name ?? "A").charAt(0).toUpperCase()}
              </div>
              <div className="pb-1">
                <p className="text-xl font-bold text-gray-900">{profile.name}</p>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
            <span className="mb-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">Admin</span>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Access level</p>
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <span key={permission} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">✓ {permission}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Quick access</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {access.map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center text-sm font-medium text-gray-700 transition hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </section>
      <AccountForms name={profile.name ?? ""} email={profile.email ?? ""} isAdmin />
    </main>
  );
}
