"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { searchCategories } from "@/config/site";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    if (!params.toString()) return;
    router.push(`/products?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      style={{ colorScheme: "light" }}
      className="flex h-11 w-full items-center rounded-full border border-gray-300 bg-gray-50 text-gray-900 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100"
    >
      {/* Category dropdown with arrow */}
      <div className="relative h-full shrink-0 border-r border-gray-300">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Search category"
          className="h-full max-w-[190px] cursor-pointer appearance-none truncate rounded-l-full bg-transparent pl-4 pr-9 text-sm font-medium text-gray-700 outline-none hover:bg-gray-100"
        >
          {searchCategories.map((c) => (
            <option key={c.value} value={c.value} className="bg-white text-gray-900">
              {c.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
      </div>

      {/* Search input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products, brands and more..."
        aria-label="Search products"
        className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm text-gray-900 caret-indigo-600 outline-none placeholder:text-gray-400"
      />

      {/* Search button */}
      <button
        type="submit"
        aria-label="Search"
        className="m-1 flex h-9 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700"
      >
        <Search size={18} />
      </button>
    </form>
  );
}