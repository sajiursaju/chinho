// components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import CartLink from "@/components/CartLink";
import CategoryMenu from "@/components/CategoryMenu";
import AnnouncementBar from "@/components/AnnouncementBar";
import { MAIN_CATEGORIES } from "@/config/categories";

type SessionUser = {
  id: number;
  name: string;
  avatar: string | null;
};

// Round avatar: the picture if it loads, otherwise the first letter of the name
function Avatar({
  user,
  size,
}: {
  user: SessionUser;
  size: "sm" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const box = size === "sm" ? "w-8 h-8 text-sm" : "w-14 h-14 text-xl";

  if (user.avatar && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar}
        alt={user.name}
        onError={() => setFailed(true)}
        className={`${box} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${box} rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white`}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const router = useRouter();
  const pathname = usePathname();

  // Ask /api/me who is logged in. Runs again on every page change,
  // so the header updates right after login or logout.
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => setUser(data?.id ? data : null))
      .catch(() => setUser(null));
    setCardOpen(false);
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q && searchCategory === "all") return;

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (searchCategory !== "all") params.set("category", searchCategory);
    router.push(`/products?${params.toString()}`);
  }

  async function handleLogout() {
    // POST -> /api/logout
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setCardOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-50">
      {/* Announcement bar */}
      <AnnouncementBar />

      {/* Main row: logo | search | cart + account */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
          {/* Logo (left) */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-white shrink-0"
          >
            chinho
          </Link>

          {/* Search bar (middle) */}
          <form
            onSubmit={handleSearch}
            className="flex flex-1 max-w-3xl mx-auto h-11 rounded-md overflow-hidden bg-white min-w-0"
          >
            {/* Category select with arrow */}
            <div className="relative shrink-0 bg-gray-100 border-r border-gray-300">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                aria-label="Search category"
                className="h-full appearance-none bg-transparent text-gray-700 text-sm font-medium pl-4 pr-9 outline-none cursor-pointer"
              >
                <option value="all">All</option>
                {MAIN_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Text input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for clothes..."
              className="flex-1 min-w-0 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none"
            />

            {/* Search icon button */}
            <button
              type="submit"
              aria-label="Search"
              className="shrink-0 w-14 bg-indigo-500 hover:bg-indigo-600 transition-colors flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
            </button>
          </form>

          {/* Cart + account (right) */}
          <div className="flex items-center gap-4 shrink-0">
            <CartLink />

            {user ? (
              // Avatar + name. Hover opens the account card.
              <div
                className="relative"
                onMouseEnter={() => setCardOpen(true)}
                onMouseLeave={() => setCardOpen(false)}
              >
                <Link
                  href={`/account/${user.id}`}
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  <Avatar user={user} size="sm" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {user.name}
                  </span>
                </Link>

                {/* Account card (pt-2 keeps the hover alive between name and card) */}
                {cardOpen && (
                  <div className="absolute right-0 top-full pt-2 w-72 z-50">
                    <div className="bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                      {/* Top: avatar, name, client id */}
                      <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-100">
                        <Avatar user={user} size="lg" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Client ID: #{user.id}
                          </p>
                        </div>
                      </div>

                      {/* Links */}
                      <nav className="py-1 text-sm">
                        <Link
                          href={`/account/${user.id}`}
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          My Account
                        </Link>
                        <Link
                          href={`/account/${user.id}/edit`}
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          Edit Profile
                        </Link>
                        <Link
                          href={`/account/${user.id}?tab=orders`}
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          My Orders
                        </Link>
                        <Link
                          href={`/account/${user.id}?tab=addresses`}
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          Addresses
                        </Link>
                      </nav>

                      {/* Logout */}
                      <div className="border-t border-gray-100 p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <Link href="/login" className="hover:underline">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-indigo-500 px-3 py-1.5 rounded hover:bg-indigo-600 transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Second row: Categories hover menu */}
      <nav className="bg-gray-800 text-white border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <CategoryMenu />
        </div>
      </nav>
    </div>
  );
}