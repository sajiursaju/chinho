"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  role: string;
  hasAvatar?: boolean;
};

export default function AuthLinks() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;

    function loadUser() {
      fetch("/api/me", { cache: "no-store" })
        .then((response) => response.json())
        .then((data) => {
          if (!ignore) setUser(data.user ?? null);
        })
        .catch(() => {
          if (!ignore) setUser(null);
        });
    }

    loadUser();
    window.addEventListener("auth-changed", loadUser);

    return () => {
      ignore = true;
      window.removeEventListener("auth-changed", loadUser);
    };
  }, [pathname]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
    setMenuOpen(false);
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
    router.refresh();
  }

  if (!user || user.role === "admin") {
    return (
      <div className="flex items-center gap-2 whitespace-nowrap text-sm sm:gap-3">
        <Link href="/login" className="underline underline-offset-2 hover:text-indigo-200">Log in</Link>
        <Link href="/signup" className="rounded bg-indigo-500 px-3 py-1.5 transition hover:bg-indigo-600">Sign up</Link>
      </div>
    );
  }

  const firstName = user.name.trim().split(" ")[0] || "Account";
  const initial = user.name.trim().charAt(0).toUpperCase() || "A";
  const profileHref = `/users/${user.id}`;
  const editHref = `${profileHref}/edit`;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={`Open account menu for ${user.name}`}
        className="flex items-center gap-2 rounded-full p-1.5 text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {user.hasAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/api/account/avatar" alt="" className="h-9 w-9 rounded-full border border-white/30 object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold">{initial}</span>
        )}
        <span className="hidden text-sm font-medium sm:inline">Hi, {firstName}</span>
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {menuOpen && (
        <div role="menu" className="absolute right-0 top-full z-[70] mt-3 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-xl">
          <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Signed in as</p>
            <p className="mt-1 truncate font-semibold">{user.name}</p>
          </div>
          <nav aria-label="Customer account" className="p-2">
            <Link role="menuitem" href={profileHref} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm hover:bg-gray-50">
              <span className="block font-semibold">My profile</span>
              <span className="mt-0.5 block text-xs text-gray-500">View your account details</span>
            </Link>
            <Link role="menuitem" href={editHref} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm hover:bg-gray-50">
              <span className="block font-semibold">Update account</span>
              <span className="mt-0.5 block text-xs text-gray-500">Edit your name, email, phone, or address</span>
            </Link>
            <Link role="menuitem" href="/orders" onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-gray-50">My orders</Link>
          </nav>
          <div className="border-t border-gray-100 p-2">
            <button type="button" role="menuitem" onClick={handleLogout} className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Log out</button>
          </div>
        </div>
      )}
    </div>
  );
}
