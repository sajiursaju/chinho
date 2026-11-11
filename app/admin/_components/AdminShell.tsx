// app/admin/_components/AdminShell.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";

type Props = {
  name: string;
  email: string;
  children: React.ReactNode;
};

const accent = "#2563eb";

export default function AdminShell({ name, email, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  // While the menu is open: Escape closes it, and the page behind cannot scroll.
  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Cleanup runs when the menu closes: put everything back.
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* ── DESKTOP: sidebar always visible on the left (md and wider) ── */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 md:block">
        <AdminSidebar name={name} email={email} />
      </aside>

      {/* ── MOBILE: dark overlay behind the menu, tap it to close ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── MOBILE: menu panel that slides in from the RIGHT ── */}
      <div
        id="admin-mobile-menu"
        aria-hidden={!menuOpen}
        className={`fixed inset-y-0 right-0 z-50 w-64 transition-[transform,visibility] duration-300 md:hidden ${
          menuOpen ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
      >
        <AdminSidebar
          name={name}
          email={email}
          onClose={() => setMenuOpen(false)}
        />

        {/* Close (X) button in the top-right corner of the panel */}
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-3 rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* ── Main content area ── */}
      <div className="min-w-0 flex-1">
        {/* Top bar: title on the left, three-dots button on the right (phone) */}
        <header className="flex items-center justify-between gap-3 border-b bg-white px-4 py-4 md:px-6">
          <h1 className="min-w-0 truncate font-semibold text-gray-800">
            Store Administration
          </h1>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              View store ↗
            </Link>

            {/* "Admin" badge: hidden on phone to save space */}
            <span
              className="hidden rounded-full px-3 py-1 text-xs font-semibold text-white md:inline-block"
              style={{ backgroundColor: accent }}
            >
              Admin
            </span>

            {/* Three-dots button: phone only, on the right side */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-menu"
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        {children}
      </div>
    </div>
  );
}