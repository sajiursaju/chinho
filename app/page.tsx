import Link from "next/link";
import { siteConfig } from "@/config/site";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import HomepageHeroCarousel from "@/components/HomepageHeroCarousel";
import { getHomeProducts, HOME_PRODUCT_COUNT } from "@/lib/products";
import { getHomepageSlides } from "@/lib/homepageSlides";

export const revalidate = 60;

export default async function HomePage() {
  const [products, slides] = await Promise.all([
    getHomeProducts(HOME_PRODUCT_COUNT),
    getHomepageSlides(false),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <HomepageHeroCarousel slides={slides} storeName={siteConfig.name} />

      <div className="flex gap-8">
        <CategorySidebar />

        <section className="min-w-0 flex-1" aria-labelledby="featured-products-title">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
                Picked for you
              </p>
              <h2
                id="featured-products-title"
                className="mt-1 text-2xl font-bold text-gray-900"
              >
                Featured Products
              </h2>
            </div>

            <Link
              href="/products"
              className="shrink-0 text-sm font-semibold text-indigo-700 hover:underline"
            >
              Shop all
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="font-medium text-gray-800">New styles are on the way.</p>
              <p className="mt-1 text-sm text-gray-500">
                There are no products to feature just yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}