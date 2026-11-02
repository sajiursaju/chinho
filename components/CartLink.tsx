"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function CartLink() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="relative text-sm font-medium hover:underline">
      Cart
      {totalItems > 0 && (
        <span className="ml-1 rounded-full bg-black px-2 py-0.5 text-xs text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}