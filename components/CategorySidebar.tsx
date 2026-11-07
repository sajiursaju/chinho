import Link from "next/link";
import { MAIN_CATEGORIES } from "@/config/categories";
import { quickLinks } from "@/config/site";

type Props = {
  activeCategory?: string;
  activeSubcategory?: string;
};

// Highlights the selected link, so the shopper can see where they are.
function linkClass(active: boolean) {
  return `block rounded-md px-3 py-2 text-sm ${
    active
      ? "bg-gray-900 font-semibold text-white"
      : "text-gray-700 hover:bg-gray-100 hover:text-black"
  }`;
}

export default function CategorySidebar({ activeCategory, activeSubcategory }: Props) {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-4 space-y-4">
        {/* Shop by category */}
        <nav aria-label="Shop by category" className="rounded-lg border border-gray-200 bg-white p-2">
          <h2 className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Shop by category
          </h2>
          <ul>
            <li>
              <Link href="/products" className={linkClass(!activeCategory)}>
                All Products
              </Link>
            </li>

            {MAIN_CATEGORIES.map((main) => {
              const isOpen = main.slug === activeCategory;
              return (
                <li key={main.slug}>
                  <details open={isOpen} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 [&::-webkit-details-marker]:hidden">
                      <span>{main.label}</span>
                      <span className="text-gray-400 transition-transform group-open:rotate-90">›</span>
                    </summary>
                    <ul className="ml-3 border-l border-gray-200 pl-2">
                      <li>
                        <Link
                          href={`/products?category=${main.slug}`}
                          className={linkClass(isOpen && !activeSubcategory)}
                        >
                          All {main.label}
                        </Link>
                      </li>
                      {main.children.map((sub) => (
                        <li key={sub.slug}>
                          <Link
                            href={`/products?category=${main.slug}&subcategory=${sub.slug}`}
                            className={linkClass(isOpen && activeSubcategory === sub.slug)}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Quick links */}
        <nav aria-label="Quick links" className="rounded-lg border border-gray-200 bg-white p-2">
          <h2 className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Quick links
          </h2>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Store promise */}
        <div className="rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
          <p className="font-semibold">Free delivery over ৳2,000</p>
          <p className="mt-1 text-gray-400">7-day easy exchange</p>
        </div>
      </div>
    </aside>
  );
}
