"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AnnouncementBar() {
  const [text, setText] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/storefront/offers", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && typeof data.announcementText === "string") {
          setText(data.announcementText.trim());
        }
      })
      .catch(() => {
        if (!cancelled) setText("");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!text) return null;

  return (
    <div className="bg-gray-900 text-xs text-gray-200">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <p className="truncate">{text}</p>
        <div className="hidden items-center gap-4 sm:flex">
          <a href="tel:+8801XXXXXXXXX" className="hover:text-white">
            Call: +88 01789-251962
          </a>
          <Link href="/orders" className="hover:text-white">Track Order</Link>
          <Link href="/help" className="hover:text-white">Help Center</Link>
        </div>
      </div>
    </div>
  );
}