import Link from "next/link";
import { siteConfig } from "@/config/site";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import { getHomeProducts, HOME_PRODUCT_COUNT } from "@/lib/products";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getHomeProducts(HOME_PRODUCT_COUNT);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <section aria-labelledby="home-hero-title" className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-800 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14 lg:px-14">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-indigo-200">Welcome to {siteConfig.name}</p>
          <h1 id="home-hero-title" className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">Style made for <span className="text-amber-300">your everyday.</span></h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-indigo-100 sm:text-lg">{siteConfig.slogan} Discover fresh styles for every occasion, with free delivery on orders over ৳2,000 and easy exchanges.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/products" className="rounded-lg bg-amber-300 px-5 py-3 text-sm font-bold text-gray-950 transition hover:bg-amber-200">Shop all products <span aria-hidden="true">→</span></Link>
            <Link href="/products?category=women" className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Explore women&apos;s styles</Link>
            <Link href="/products?category=men" className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Explore men&apos;s styles</Link>
          </div>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-7 right-8 hidden select-none text-[10rem] font-black leading-none text-white/5 lg:block">C</div>
      </section>

      <div className="flex gap-8">
        <CategorySidebar />
        <section className="min-w-0 flex-1" aria-labelledby="featured-products-title">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Picked for you</p>
              <h2 id="featured-products-title" className="mt-1 text-2xl font-bold text-gray-900">Featured Products</h2>
            </div>
            <Link href="/products" className="shrink-0 text-sm font-semibold text-indigo-700 hover:underline">Shop all</Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="font-medium text-gray-800">New styles are on the way.</p>
              <p className="mt-1 text-sm text-gray-500">There are no products to feature just yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
