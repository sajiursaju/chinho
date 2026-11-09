// components/account/AccountSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
  id: number;
};

const links = (id: number) => [
  { label: "Profile", href: `/account/${id}` },
  { label: "Edit Profile", href: `/account/${id}/edit` },
  { label: "Orders", href: `/account/${id}?tab=orders` },
  { label: "Addresses", href: `/account/${id}?tab=addresses` },
];

export default function AccountSidebar({ id }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab"); // null, "orders" or "addresses"

  return (
    <aside className="w-56 shrink-0">
      <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {links(id).map((link) => {
          const [path, query] = link.href.split("?");
          const linkTab = query ? new URLSearchParams(query).get("tab") : null;

          // Active only when both the path and the tab match
          const isActive = pathname === path && currentTab === linkTab;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-5 py-3 text-sm font-medium border-b border-gray-100 last:border-0 transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}