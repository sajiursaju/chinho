import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import { getHomeProducts, HOME_PRODUCT_COUNT } from "@/lib/products";

// Rebuild this page at most once every 60 seconds, so it loads fast
// and admin product changes appear within a minute.
export const revalidate = 60;

export default async function HomePage() {
  const products = await getHomeProducts(HOME_PRODUCT_COUNT);

  return (
    // A <div> instead of <main>, because the layout already provides the <main> element.
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
      {/* Left column: shop by category and quick links (large screens) */}
      <CategorySidebar />

      {/* Right column: the product grid */}
      <section className="min-w-0 flex-1">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <span className="text-sm text-gray-500">{products.length} items</span>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500">No products yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}