"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CartLink from "@/components/CartLink";
import CategoryMenu from "@/components/CategoryMenu";
import AnnouncementBar from "@/components/AnnouncementBar";
import AuthLinks from "@/components/AuthLinks";
import { MAIN_CATEGORIES } from "@/config/categories";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const router = useRouter();

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const params = new URLSearchParams({ q: query });
    if (searchCategory !== "all") params.set("category", searchCategory);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div id="top" className="sticky top-0 z-50">
      <AnnouncementBar />

      <header className="bg-gray-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-4">
          <Link href="/" className="shrink-0 text-2xl font-bold tracking-tight text-white">
            chinho
          </Link>

          <div className="hidden shrink-0 sm:block">
            <CategoryMenu />
          </div>

          <form
            onSubmit={handleSearch}
            role="search"
            className="order-3 flex min-w-full flex-1 items-center overflow-hidden rounded-md border border-gray-600 transition-colors focus-within:border-indigo-400 sm:order-none sm:min-w-0"
          >
            <label htmlFor="header-search-category" className="sr-only">
              Search category
            </label>
            <select
              id="header-search-category"
              value={searchCategory}
              onChange={(event) => setSearchCategory(event.target.value)}
              className="hidden cursor-pointer border-r border-gray-600 bg-gray-800 px-2 py-2 text-sm text-gray-200 outline-none hover:bg-gray-700 sm:block"
            >
              <option value="all">All</option>
              {MAIN_CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>

            <label htmlFor="header-search" className="sr-only">
              Search products
            </label>
            <input
              id="header-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search for products..."
              className="min-w-0 flex-1 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />

            <button
              type="submit"
              aria-label="Search"
              className="flex shrink-0 items-center justify-center bg-indigo-500 px-4 py-2 transition-colors hover:bg-indigo-600"
            >
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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

          <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
            <CartLink />
            <AuthLinks />
          </div>
        </div>
      </header>

      <nav
        aria-label="Main navigation"
        className="border-b border-gray-200 bg-white text-gray-800 shadow-sm"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 text-sm font-medium [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/" className="shrink-0 rounded-md px-3 py-2 hover:bg-gray-100">
            Home
          </Link>
          <Link href="/products" className="shrink-0 rounded-md px-3 py-2 hover:bg-gray-100">
            Shop all
          </Link>
          {MAIN_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="shrink-0 rounded-md px-3 py-2 hover:bg-gray-100"
            >
              {category.label}
            </Link>
          ))}
          <Link href="/orders" className="shrink-0 rounded-md px-3 py-2 hover:bg-gray-100">
            My orders
          </Link>
          <Link href="/account" className="shrink-0 rounded-md px-3 py-2 hover:bg-gray-100">
            My account
          </Link>
        </div>
      </nav>
    </div>
  );
}