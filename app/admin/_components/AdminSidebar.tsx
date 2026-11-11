// app/admin/_components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/admin", icon: "▦" },
  { label: "Products", href: "/admin/products", icon: "□" },
  { label: "Categories", href: "/admin/categories", icon: "▣" },
  { label: "Inventory", href: "/admin/inventory", icon: "▤" },
  { label: "Orders", href: "/admin/orders", icon: "◫" },
  { label: "Customers", href: "/admin/customers", icon: "♙" },
  { label: "Discounts", href: "/admin/discounts", icon: "◌" },
  { label: "Reviews", href: "/admin/reviews", icon: "★" },
  { label: "Reports", href: "/admin/reports", icon: "▨" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
  { label: "Account", href: "/admin/account", icon: "◉" },
];

const accent = "#2563eb";

type Props = {
  name: string;
  email: string;
  onClose?: () => void; // called when a link is clicked on mobile
};

export default function AdminSidebar({ name, email, onClose }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-gray-950 p-5 text-white">
      {/* Logo */}
      <Link
        href="/admin"
        onClick={onClose}
        className="mb-8 text-xl font-bold"
      >
        Admin<span style={{ color: accent }}>Panel.</span>
      </Link>

      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
        Workspace
      </p>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 overflow-y-auto">
        {links.map((link) => {
          // Exact match for dashboard, startsWith for the rest
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile at bottom */}
      <div className="mt-auto border-t border-gray-800 pt-5">
        <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
          Signed in as
        </p>
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="mt-1 break-all text-xs text-gray-400">{email}</p>
        <Link
          href="/admin/account"
          onClick={onClose}
          className="mt-4 inline-block text-sm text-gray-300 hover:text-white"
        >
          My account →
        </Link>
      </div>
    </div>
  );
}