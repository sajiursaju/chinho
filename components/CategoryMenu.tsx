"use client";

import { useState } from "react";
import Link from "next/link";

// Matches your Nov 2026 decision: Men and Women only, with sub-categories
const categories = [
  {
    name: "Men",
    slug: "men",
    sub: [
      { name: "Shirts", slug: "shirts" },
      { name: "Polos", slug: "polos" },
      { name: "Tees", slug: "tees" },
      { name: "Panjabi", slug: "panjabi" },
      { name: "Bottoms", slug: "bottoms" },
      { name: "Outerwear", slug: "outerwear" },
      { name: "Accessories", slug: "accessories" },
    ],
  },
  {
    name: "Women",
    slug: "women",
    sub: [
      { name: "Sharee", slug: "sharee" },
      { name: "3-Piece", slug: "3-piece" },
      { name: "Tops", slug: "tops" },
      { name: "Bottoms", slug: "bottoms" },
      { name: "Dresses", slug: "dresses" },
      { name: "Outerwear", slug: "outerwear" },
      { name: "Accessories", slug: "accessories" },
    ],
  },
];

export default function CategoryMenu() {
  // Track which top-level category is hovered so we can show its sub-list
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setMenuOpen(true)}
      onMouseLeave={() => {
        setMenuOpen(false);
        setActiveCategory(null);
      }}
    >
      {/* Trigger button in the header */}
      <button className="flex items-center gap-1 text-sm font-medium text-white hover:text-yellow-300 transition-colors">
        Categories
        <svg
          className="w-4 h-4"
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
      </button>

      {/* Dropdown — only shown when menuOpen */}
      {menuOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 flex shadow-xl rounded-md overflow-hidden">
          {/* Left column: top-level categories */}
          <ul className="bg-white w-44 py-1 border border-gray-200">
            {categories.map((cat) => (
              <li
                key={cat.slug}
                onMouseEnter={() => setActiveCategory(cat.slug)}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-100 ${
                  activeCategory === cat.slug ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="flex-1"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
                {/* Right arrow to signal sub-menu exists */}
                <svg
                  className="w-3 h-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
            ))}
          </ul>

          {/* Right column: sub-categories for the hovered parent */}
          {activeCategory && (
            <ul className="bg-white w-44 py-1 border-t border-b border-r border-gray-200">
              {categories
                .find((c) => c.slug === activeCategory)
                ?.sub.map((sub) => (
                  <li key={sub.slug}>
                    <Link
                      href={`/products?category=${activeCategory}&sub=${sub.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}