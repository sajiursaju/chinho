"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/components/CartContext";

type Product = {
  id: number;
  name: string;
  price: number | string;
  image?: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
      {/* Photo -> /products/[id] */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <ShoppingBag size={48} />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        {/* Name -> /products/[id] */}
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-900 group-hover:text-indigo-600">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-lg font-bold text-gray-900">
          ${Number(product.price).toFixed(2)}
        </p>

        {/* Add to cart */}
        <button
          type="button"
          onClick={handleAdd}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-white transition active:scale-95 ${
            added ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          {added ? "Added" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}