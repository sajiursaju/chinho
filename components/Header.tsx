import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { categories } from "@/config/site";
import AnnouncementBar from "@/components/AnnouncementBar";
import SearchBar from "@/components/SearchBar";
import MobileMenu from "@/components/MobileMenu";
import CartLink from "@/components/CartLink";
import AuthLinks from "@/components/AuthLinks";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 text-white backdrop-blur">
      <AnnouncementBar />

      {/* Main bar */}
      <div className="border-b border-gray-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[72px] lg:gap-8 lg:px-8">
          <MobileMenu />

          {/* Logo -> / */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/30">
              <ShoppingBag size={20} />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              My<span className="text-indigo-400">Store</span>
            </span>
          </Link>

          {/* Search (desktop) */}
          <div className="hidden max-w-2xl flex-1 lg:block">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            {/* Wishlist -> /wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden rounded-full p-2.5 text-gray-200 transition hover:bg-gray-800 hover:text-white sm:block"
            >
              <Heart size={22} />
            </Link>

            {/* Cart -> /cart */}
            <CartLink />

            {/* Login / Hi, name / Logout */}
            <AuthLinks />
          </div>
        </div>

        {/* Search (mobile) */}
        <div className="px-4 pb-3 lg:hidden">
          <SearchBar />
        </div>
      </div>

      {/* Category bar (desktop) */}
      <nav className="hidden border-b border-gray-800 lg:block">
        <ul className="mx-auto flex h-11 max-w-7xl items-center gap-1 overflow-x-auto px-8">
          {categories.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  c.label === "Deals"
                    ? "text-rose-400 hover:bg-gray-800"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}