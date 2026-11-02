import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function AnnouncementBar() {
  return (
    <div className="bg-gray-900 text-xs text-gray-200">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <p className="truncate">{siteConfig.announcement}</p>
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