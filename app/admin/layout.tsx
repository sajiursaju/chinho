import Link from "next/link";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/adminProducts";

const accentColors = {
  Blue: "#2563eb",
  Purple: "#7c3aed",
  Green: "#16a34a",
  Orange: "#ea580c",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  if (!admin) redirect("/");

  const [rows]: any = await pool.query(
    "SELECT name, email FROM users WHERE id = ? LIMIT 1",
    [admin.id]
  );

  const profile = rows[0];
  const accent = accentColors.Blue;

  const links = [
    { label: "Dashboard", href: "/admin", icon: "▦" },
    { label: "Products", href: "/admin/products", icon: "□" },
    { label: "Customers", href: "/admin/customers", icon: "♙" },
    { label: "Orders", href: "/admin/orders", icon: "▤" },
    { label: "Account", href: "/admin/account", icon: "◉" },
  ];

  return (
    <div
      className="min-h-screen bg-gray-50 md:flex"
      style={{ "--admin-accent": accent } as React.CSSProperties}
    >
      <aside className="flex w-full flex-col bg-gray-950 p-5 text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <Link href="/admin" className="mb-8 text-xl font-bold">
          Admin<span style={{ color: accent }}>Panel.</span>
        </Link>

        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Workspace
        </p>

        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-gray-800 pt-5">
          <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
            Signed in as
          </p>
          <p className="truncate text-sm font-semibold">
            {profile?.name ?? admin.name}
          </p>
          <p className="mt-1 break-all text-xs text-gray-400">
            {profile?.email ?? "Email unavailable"}
          </p>
          {/* Link -> /admin/account (stays inside the dashboard) */}
          <Link
            href="/admin/account"
            className="mt-4 inline-block text-sm text-gray-300 hover:text-white"
          >
            My account →
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b bg-white px-6 py-4">
          <h1 className="font-semibold text-gray-800">Store Administration</h1>
          <div className="flex items-center gap-4">
            {/* Link -> / (user site) */}
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View store ↗
            </Link>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              Admin
            </span>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}