import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/products";
import HeroCarousel from "@/components/HeroCarousel";
export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();
  const featured = products.slice(0, 4);

  return (
    <>
      <section className="bg-gray-100 py-20 text-center">
        <h1 className="text-4xl font-bold">Welcome to MyStore</h1>
        <p className="mt-3 text-gray-600">Quality products at great prices.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded bg-black px-6 py-3 text-white"
        >
          Shop now
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <Link href="/products" className="text-sm underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}