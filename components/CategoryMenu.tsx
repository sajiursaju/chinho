// components/CategoryMenu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { MAIN_CATEGORIES } from "@/config/categories";

export default function CategoryMenu() {
  // Which top-level category is hovered, so we can show its sub-list
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeMain = MAIN_CATEGORIES.find((c) => c.slug === activeCategory);

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

      {/* Dropdown, only shown when menuOpen */}
      {menuOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 flex shadow-xl rounded-md overflow-hidden">
          {/* Left column: top-level categories */}
          <ul className="bg-white w-44 py-1 border border-gray-200">
            {MAIN_CATEGORIES.map((cat) => (
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
                  {cat.label}
                </Link>
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

          {/* Right column: subcategories of the hovered parent */}
          {activeMain && (
            <ul className="bg-white w-44 py-1 border-t border-b border-r border-gray-200">
              {activeMain.children.map((sub) => (
                <li key={sub.slug}>
                  <Link
                    href={`/products?category=${activeMain.slug}&subcategory=${sub.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {sub.label}
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