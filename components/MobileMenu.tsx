"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig, categories, quickLinks } from "@/config/site";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="rounded-full p-2 text-gray-700 hover:bg-gray-100"
      >
        <Menu size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85%] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
              <span className="text-lg font-bold">{siteConfig.name}</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Shop
              </p>
              {categories.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  {c.label}
                </Link>
              ))}

              <p className="px-3 pb-2 pt-5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                My Space
              </p>
              {quickLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}