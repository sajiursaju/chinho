// components/Header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CartLink from "@/components/CartLink";
import CategoryMenu from "@/components/CategoryMenu";
import AnnouncementBar from "@/components/AnnouncementBar";
import Image from "next/image";
import { MAIN_CATEGORIES } from "@/config/categories";

type SessionUser = {
  id: number;
  name: string;
  avatar: string | null;
};

export default function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.id) setUser(data);
      })
      .catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Build the URL: /products?q=shirt&category=men
    const params = new URLSearchParams();
    params.set("q", q);
    if (searchCategory !== "all") params.set("category", searchCategory);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="sticky top-0 z-50">
      {/* Announcement bar */}
      <AnnouncementBar />

      {/* Main header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-white shrink-0"
          >
            chinho
          </Link>

          {/* Category Menu */}
          <div className="shrink-0">
            <CategoryMenu />
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center rounded-md overflow-hidden border border-gray-600 focus-within:border-indigo-400 transition-colors"
          >
            {/* Category select */}
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-gray-800 text-gray-300 text-sm px-2 py-2 border-r border-gray-600 outline-none cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <option value="all">All</option>
              {MAIN_CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Text input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 bg-white text-gray-900 text-sm px-3 py-2 outline-none placeholder-gray-400"
            />

            {/* Search button */}
            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 transition-colors px-4 py-2 flex items-center justify-center shrink-0"
            >
              <svg
                className="w-4 h-4 text-white"
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

          {/* Right side */}
          <div className="flex items-center gap-4 shrink-0">
            <CartLink />

            {user ? (
              <Link
                href={`/account/${user.id}`}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover w-8 h-8"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium hidden sm:inline">
                  {user.name}
                </span>
              </Link>
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
    </div>
  );
}