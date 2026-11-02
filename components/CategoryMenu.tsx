import Link from "next/link";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { categories } from "@/config/site";

type Item = { label: string; href: string; children?: { label: string; href: string }[] };

export default function CategoryMenu() {
  const items: Item[] = categories;

  return (
    <div className="group relative">
      {/* Button */}
      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
      >
        <Menu size={18} />
        Categories
        <ChevronDown size={16} />
      </button>

      {/* Level 1: opens on hover */}
      <div className="absolute left-0 top-full hidden pt-2 group-hover:block">
        <ul className="w-72 rounded-xl border border-gray-800 bg-gray-900 py-2 shadow-xl">
          {items.map((c) => (
            <li key={c.href} className="group/item relative">
              <Link
                href={c.href}
                className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-200 transition hover:bg-gray-800 hover:text-white"
              >
                {c.label}
                {c.children && <ChevronRight size={16} />}
              </Link>

              {/* Level 2: opens on the right side */}
              {c.children && (
                <div className="absolute left-full top-0 hidden pl-1 group-hover/item:block">
                  <ul className="w-56 rounded-xl border border-gray-800 bg-gray-900 py-2 shadow-xl">
                    {c.children.map((s) => (
                      <li key={s.href}>
                        <Link
                          href={s.href}
                          className="block px-4 py-2.5 text-sm text-gray-200 transition hover:bg-gray-800 hover:text-white"
                        >
                          {s.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}