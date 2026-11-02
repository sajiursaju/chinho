"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/components/CartContext";

type Product = { id: number; name: string; price: number };

type Props = {
  product: Product;
  variant?: "default" | "card";
};

export default function AddToCartButton({ product, variant = "default" }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const styles =
    variant === "card"
      ? `flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
          added ? "bg-emerald-600" : "bg-gray-900 hover:bg-gray-700"
        }`
      : `flex items-center gap-2 rounded px-6 py-3 text-white transition ${
          added ? "bg-emerald-600" : "bg-black hover:bg-gray-800"
        }`;

  return (
    <button type="button" onClick={handleClick} className={styles}>
      {added ? <Check size={16} /> : <ShoppingCart size={16} />}
      {added ? "Added" : "Add to cart"}
    </button>
  );
}