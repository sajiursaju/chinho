"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type User = { id: number; name: string; role: string; hasAvatar?: boolean };

export default function AuthLinks() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (user) {
    const isAdmin = user.role === "admin";
    const firstName = user.name.trim().split(" ")[0];
    const initial = user.name.trim().charAt(0).toUpperCase();

    return (
      <div className="flex items-center gap-2 whitespace-nowrap text-sm sm:gap-3">
        <Link href="/account" className="flex items-center gap-2" aria-label="My account">
          {user.hasAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/api/account/avatar"
              alt=""
              className="h-8 w-8 shrink-0 rounded-full border object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-gray-100 text-sm font-semibold text-gray-700">
              {initial}
            </span>
          )}
          <span className="hidden sm:inline">Hi, {firstName}</span>
        </Link>

        {!isAdmin && (
          <>
            <Link href="/orders" className="hidden underline sm:inline">
              My Orders
            </Link>
            <Link href="/account" className="hidden underline sm:inline">
              Account
            </Link>
          </>
        )}

        <button onClick={handleLogout} className="underline">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 whitespace-nowrap text-sm sm:gap-3">
      <Link href="/login" className="underline">
        Login
      </Link>
      <Link href="/signup" className="underline">
        Sign up
      </Link>
    </div>
  );
}